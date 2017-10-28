<?php

namespace TweedeGolf\FileBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use TweedeGolf\FileBundle\Entity\Folder;

class LoadFolderData extends AbstractFixture implements OrderedFixtureInterface
{
    /**
     * {@inheritdoc}
     */
    public function load(ObjectManager $manager)
    {
        $folder = new Folder();
        $folder->setName('colors');
        $this->addReference('folder', $folder);
        $manager->persist($folder);

        $manager->flush();
    }

    /**
     * Load files first.
     */
    public function getOrder()
    {
        return 1;
    }
}
