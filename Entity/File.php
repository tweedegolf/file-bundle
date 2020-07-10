<?php

namespace TweedeGolf\FileBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Timestampable\Traits\TimestampableEntity;
use Symfony\Component\HttpFoundation\File\File as HttpFile;
use Symfony\Component\Validator\Constraints as Assert;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

/**
 * File.
 *
 * @ORM\Table(name="tg_file")
 * @ORM\Entity(repositoryClass="TweedeGolf\FileBundle\Repository\FileRepository")
 * @Vich\Uploadable
 */
class File
{
    use TimestampableEntity;

    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;
    /**
     * @var HttpFile
     *
     * @Vich\UploadableField(mapping="media", fileNameProperty="name")
     * @Assert\File(maxSize="50M", mimeTypes={
     *     "audio/mpeg",
     *     "image/png",
     *     "image/jpg",
     *     "image/jpeg",
     *     "image/gif",
     *     "image/svg+xml",
     *     "video/mp4",
     *     "video/webm",
     *     "video/ogg",
     *     "application/svg+xml",
     *     "application/pdf",
     *     "application/x-pdf",
     *     "application/msword",
     *     "application/vnd.ms-excel",
     *     "application/vnd.ms-powerpoint",
     *     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
     *     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
     *     "application/vnd.openxmlformats-officedocument.presentationml.presentation"
     *   },
     *   mimeTypesMessage="File type not allowed, allowed files are images, videos, mp3 files, or office and pdf documents."
     * )
     */
    private $file;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255)
     */
    private $name;

    /**
     * @var int
     *
     * @ORM\Column(name="size", type="integer")
     */
    private $size;

    /**
     * @ORM\ManyToOne(targetEntity="TweedeGolf\FileBundle\Entity\Folder", inversedBy="files")
     * @ORM\JoinColumn(name="folder_id", referencedColumnName="id", nullable=true)
     **/
    private $folder;

    /**
     * @var string
     *
     * @ORM\Column(name="original_name", type="string", length=255)
     */
    private $originalName;

    /**
     * @var string
     *
     * @ORM\Column(name="mime_type", type="string", length=255)
     */
    private $mimeType;

    /**
     * @return string
     */
    public function __toString()
    {
        return $this->name;
    }

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return HttpFile
     */
    public function getFile()
    {
        return $this->file;
    }

    /**
     * @param HttpFile $file
     *
     * @return $this
     */
    public function setFile(HttpFile $file)
    {
        $this->file = $file;

        if ($file) {
            $this->updatedAt = new \DateTime('now');
        }

        return $this;
    }

    /**
     * Set name.
     *
     * @param string $name
     *
     * @return $this
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name.
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return string
     */
    public function getOriginalName()
    {
        return $this->originalName;
    }

    /**
     * @param string $originalName
     * @return $this
     */
    public function setOriginalName($originalName)
    {
        $this->originalName = $originalName;

        return $this;
    }

    /**
     * @return int
     */
    public function getSize()
    {
        return $this->size;
    }

    /**
     * @param int $size
     *
     * @return $this
     */
    public function setSize($size)
    {
        $this->size = $size;

        return $this;
    }

    /**
     * @return Folder
     */
    public function getFolder()
    {
        return $this->folder;
    }

    /**
     * @param Folder $folder
     *
     * @return $this
     */
    public function setFolder(Folder $folder = null)
    {
        $this->folder = $folder;

        return $this;
    }

    /**
     * @return string
     */
    public function getMimeType()
    {
        return $this->mimeType;
    }

    /**
     * @param string $mimeType
     *
     * @return $this
     */
    public function setMimeType($mimeType)
    {
        $this->mimeType = $mimeType;

        return $this;
    }
}
