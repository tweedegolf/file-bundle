<?php

namespace TweedeGolf\FileBundle\Form;

use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Serializer\Serializer;
use TweedeGolf\FileBundle\Entity\File;
use TweedeGolf\FileBundle\Normalizer\FileNormalizer;

/**
 * Class FileType.
 */
class FileType extends AbstractType
{
    /**
     * @var
     */
    private $normalizer;

    /**
     * @var
     */
    private $locale;

    /**
     * FileType constructor.
     *
     * @param FileNormalizer $normalizer
     * @param $locale
     */
    public function __construct(FileNormalizer $normalizer, $locale)
    {
        $this->normalizer = $normalizer;
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
            'multiple' => false,
            'images_only' => false,
            'allow_move' => false,
            'allow_upload' => false,
            'allow_new_folder' => false,
            'allow_delete_file' => false,
            'allow_delete_folder' => false,
            'allow_rename_folder' => false,
            'allow_empty_recycle_bin' => false,
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
            'multiple' => $options['multiple'],
            'images_only' => $options['images_only'],
            'allow_move' => $options['allow_move'],
            'allow_upload' => $options['allow_upload'],
            'allow_new_folder' => $options['allow_new_folder'],
            'allow_delete_file' => $options['allow_delete_file'],
            'allow_delete_folder' => $options['allow_delete_folder'],
            'allow_rename_folder' => $options['allow_rename_folder'],
            'allow_empty_recycle_bin' => $options['allow_empty_recycle_bin'],
        ]);
    }

    /**
     * @return string
     */
    public function getParent()
    {
        return EntityType::class;
    }
}
