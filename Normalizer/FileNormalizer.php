<?php

namespace TweedeGolf\FileBundle\Normalizer;

use Liip\ImagineBundle\Imagine\Cache\CacheManager;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use TweedeGolf\FileBundle\Entity\File;
use TweedeGolf\FileBundle\Entity\Folder;
use TweedeGolf\FileBundle\Util\SizeHumanizer;
use Vich\UploaderBundle\Templating\Helper\UploaderHelper;

class FileNormalizer implements NormalizerInterface
{
    /**
     * @var array
     */
    const IMAGE_EXTENSIONS = ['gif', 'jpg', 'jpeg', 'png'];

    /**
     * @var CacheManager
     */
    private $cache_manager;

    /**
     * @var string
     */
    private $filter_name;

    /**
     * @var UploaderHelper
     */
    private $upload_helper;

    /**
     * FileNormalizer constructor.
     *
     * @param UploaderHelper $upload_helper
     * @param CacheManager   $cache_manager
     * @param string         $filter_name
     */
    public function __construct(UploaderHelper $upload_helper, CacheManager $cache_manager, $filter_name)
    {
        $this->upload_helper = $upload_helper;
        $this->cache_manager = $cache_manager;
        $this->filter_name = $filter_name;
    }

    /**
     * {@inheritdoc}
     */
    public function normalize($object, $format = null, array $context = array())
    {
        if ($object instanceof Folder) {
            return [
                'id' => $object->getId(),
                'name' => $object->getName(),
                'parent' => $object->getParent() ? $object->getParent()->getId() : null,
                'size_bytes' => 0,
                'size' => '',
                'create_ts' => $object->getCreatedAt()->getTimestamp(),
                'created' => $object->getCreatedAt()->format('d-m-Y H:i'),
                'thumb' => null,
                'type' => 'folder',
            ];
        }

        if ($object instanceof File) {
            return [
                'id' => $object->getId(),
                'name' => $object->getOriginalName(),
                'size_bytes' => $object->getSize(),
                'size' => SizeHumanizer::human($object->getSize()),
                'create_ts' => $object->getCreatedAt()->getTimestamp(),
                'created' => $object->getCreatedAt()->format('d-m-Y H:i'),
                'thumb' => $this->getThumbnail($object),
                'original' => $this->upload_helper->asset($object, 'file'),
                'type' => $this->getExtension($object),
            ];
        }

        return;
    }

    /**
     * {@inheritdoc}
     */
    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof File || $data instanceof Folder;
    }

    /**
     * @param File $file
     *
     * @return string|null
     */
    private function getThumbnail(File $file)
    {
        $ext = $this->getExtension($file);
        if (!in_array($ext, self::IMAGE_EXTENSIONS)) {
            return;
        }

        return $this->cache_manager->getBrowserPath($file->getName(), $this->filter_name);
    }

    /**
     * @param File $file
     *
     * @return mixed
     */
    private function getExtension(File $file)
    {
        return strtolower(pathinfo($file->getName(), PATHINFO_EXTENSION));
    }
}
