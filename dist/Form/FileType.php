<?php

namespace TweedeGolf\FileBundle\Form;

use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Serializer;
use TweedeGolf\FileBundle\Entity\File;
use TweedeGolf\FileBundle\Helper\ApiUrlHelperInterface;
use TweedeGolf\FileBundle\Normalizer\FileNormalizer;

/**
 * Class FileType.
 */
class FileType extends AbstractType
{
    /**
     * @var FileNormalizer
     */
    private $normalizer;

    /**
     * @var
     */
    private $locale;

    /**
     * @var ApiUrlHelperInterface
     */
    private $urlHelper;

     /**
     * FileType constructor.
     *
     * @param FileNormalizer $normalizer
     * @param ApiUrlHelperInterface $urlHelper
     * @param $locale
     */
    public function __construct(FileNormalizer $normalizer, ApiUrlHelperInterface $urlHelper, $locale)
    {
        $this->normalizer = $normalizer;
        $this->urlHelper = $urlHelper;
        $this->locale = $locale;
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'class' => 'TGFileBundle:File',
            'required' => true,
            'root_folder_id' => null,
            'images_only' => false,
            'allow_move' => true,
            'allow_upload' => true,
            'allow_new_folder' => true,
            'allow_delete_file' => true,
            'allow_delete_folder' => true,
            'allow_rename_folder' => true,
            'allow_select_multiple' => true,
            'allow_upload_multiple' => true,
            'allow_empty_recycle_bin' => true,
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        $serializer = new Serializer([$this->normalizer]);
        $data = $form->getData();

        if ($data instanceof File) {
            $data = new ArrayCollection([$data]);
        }

        $view->vars['options'] = json_encode([
            'name' => $view->vars['full_name'],
            'language' => $this->locale,
            'selected' => $serializer->normalize($data),
            'root_folder_id' => $options['root_folder_id'],
            'images_only' => $options['images_only'],
            'allow_move' => $options['allow_move'],
            'allow_upload' => $options['allow_upload'],
            'allow_new_folder' => $options['allow_new_folder'],
            'allow_delete_file' => $options['allow_delete_file'],
            'allow_delete_folder' => $options['allow_delete_folder'],
            'allow_rename_folder' => $options['allow_rename_folder'],
            'allow_select_multiple' => $options['allow_select_multiple'],
            'allow_upload_multiple' => $options['allow_upload_multiple'],
            'allow_empty_recycle_bin' => $options['allow_empty_recycle_bin'],
        ]);

        $view->vars['api_url'] = $this->urlHelper->getApiUrl();
    }

    /**
     * @return string
     */
    public function getParent()
    {
        return EntityType::class;
    }
}
