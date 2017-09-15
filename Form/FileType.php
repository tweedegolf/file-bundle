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
            'images_only' => false,
            'required' => true,
            'multiple' => false,
            'allow_upload' => true,
            'allow_delete' => true,
            'allow_new_folder' => true,
            'allow_delete_folder' => true,
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
            'multiple' => $options['multiple'],
            'name' => $view->vars['full_name'],
            'images_only' => $options['images_only'],
            'selected' => $serializer->normalize($data),
            'language' => $this->locale,
            'allow_upload' => $options['allow_upload'],
            'allow_delete' => $options['allow_delete'],
            'allow_new_folder' => $options['allow_new_folder'],
            'allow_delete_folder' => $options['allow_delete_folder'],
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
