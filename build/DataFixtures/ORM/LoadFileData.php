<?php

namespace TweedeGolf\FileBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use Faker\Factory;
use Faker\Generator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use TweedeGolf\FileBundle\Entity\File;

class LoadFileData extends AbstractFixture implements ContainerAwareInterface, OrderedFixtureInterface
{
    /**
     * @var int
     */
    const FAKE_FILE_COUNT = 10;

    /**
     * @var ContainerInterface
     */
    private $container;

    /**
     * @var Generator
     */
    private $faker;

    /**
     * LoadFileData constructor.
     */
    public function __construct()
    {
        $this->faker = Factory::create();
    }

    /**
     * {@inheritdoc}
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * {@inheritdoc}
     */
    public function load(ObjectManager $manager)
    {
        for ($i = 0; $i < self::FAKE_FILE_COUNT; $i += 1) {
            $image = $this->createImage();
            $file = new File();
            $file->setFile($image);
            $file->setSize($image->getSize());
            $file->setOriginalName($image->getClientOriginalName());
            $file->setMimeType($image->getMimeType());
            $file->setFolder($this->getReference('folder'));

            $this->addReference('file-'.$i, $file);
            $manager->persist($file);
        }

        $manager->flush();
    }

    /**
     *
     */
    private function createImage()
    {
        $dir = $this->container->getParameter('kernel.cache_dir');
        $color = $this->faker->colorName;
        $name = $color.'.jpg';
        $path = $dir.'/'.$name;
        $image = new \Imagick();
        $image->newImage(640, 480, $color);
        $image->setImageFormat('jpg');
        $image->writeImage($path);

        return new UploadedFile($path, $name);
    }

    /**
     * Load files first.
     */
    public function getOrder()
    {
        return 2;
    }
}
