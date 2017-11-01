<?php

namespace TweedeGolf\FileBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Timestampable\Traits\TimestampableEntity;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Folder.
 *
 * @ORM\Table(name="tg_folder")
 * @ORM\Entity(repositoryClass="TweedeGolf\FileBundle\Repository\FolderRepository")
 */
class Folder
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
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255)
     * @Assert\NotBlank()
     */
    private $name;

    /**
     * @ORM\ManyToOne(targetEntity="TweedeGolf\FileBundle\Entity\Folder", inversedBy="children")
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id", nullable=true)
     **/
     private $parent;

     /**
     * @ORM\OneToMany(targetEntity="TweedeGolf\FileBundle\Entity\Folder", mappedBy="parent")
     **/
     private $children;

     /**
     * @ORM\OneToMany(targetEntity="TweedeGolf\FileBundle\Entity\File", mappedBy="folder")
     **/
     private $files;

     /**
     * @var boolean
     *
     * @ORM\Column(name="is_trashed", type="boolean")
     */
    private $isTrashed = false;

    /**
     * File constructor.
     */
    public function __construct()
    {
        $this->children = new ArrayCollection();
        $this->files = new ArrayCollection();
    }

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
     * Set name.
     *
     * @param string $name
     *
     * @return Folder
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
     * @return Folder
     */
    public function getParent()
    {
        return $this->parent;
    }

    /**
     * @param Folder $parent
     *
     * @return $this
     */
    public function setParent(Folder $parent = null)
    {
        $this->parent = $parent;

        return $this;
    }

    /**
     * @return Collection
     */
    public function getChildren()
    {
        return $this->children;
    }

    /**
     * @return Collection
     */
    public function getFiles()
    {
        return $this->files;
    }

    /**
     * @return boolean
     */
     public function getIsTrashed()
     {
         return $this->isTrashed;
     }

     /**
      * @param string $isTrashed
      *
      * @return $this
      */
     public function setIsTrashed($isTrashed)
     {
         $this->isTrashed = $isTrashed;

         return $this;
     }}
