<?php

namespace TweedeGolf\FileBundle\Controller;

use Doctrine\DBAL\Exception\ForeignKeyConstraintViolationException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\Serializer;
use TweedeGolf\FileBundle\Entity\Folder;
use Doctrine\ORM\EntityManager as Manager;

class FolderController extends Controller
{
    /**
    * @param Folder $folder
    * @param Manager $manager
    * @param Array $errors
    *
    * @return Void
    */
    private function setTrashed($folder, $manager)
    {
        $folder->setIsTrashed(true);
        $manager->persist($folder);

        $files = $folder->getFiles();
        foreach ($files as $file) {
            $file->setIsTrashed(true);
            $manager->persist($file);
        }

        $folders = $folder->getChildren();
        foreach ($folders as $folder) {
            $this->setTrashed($folder, $manager);
        }
    }

    /**
     * @param Folder $folder
     *
     * @return JsonResponse
     *
     * @Route("/list/{id}", defaults={"id" = null})
     */
    public function indexAction(Folder $folder = null)
    {
        if (null !== $folder) {
            $files = $folder->getFiles();
            $folders = $folder->getChildren();
        } else {
            $files = $this->getDoctrine()->getRepository('TGFileBundle:File')->findByFolder(null);
            $folders = $this->getDoctrine()->getRepository('TGFileBundle:Folder')->findByParent(null);
        }

        $serializer = new Serializer([$this->get('tg_file.normalizer')]);

        return new JsonResponse([
            'files' => $serializer->normalize($files),
            'folders' => $serializer->normalize($folders),
        ]);
    }

    /**
     * @param Request $request
     * @param Folder  $parent_folder
     *
     * @return JsonResponse
     *
     * @Route("/create/folder/{id}", defaults={"id" = null})
     * @Method({"POST"})
     */
    public function createAction(Request $request, Folder $parent_folder = null)
    {
        $name = $request->get('name');
        $validator = $this->get('validator');
        $manager = $this->getDoctrine()->getManager();
        $new_folder = null;
        $errors = [];

        $folder = new Folder();
        if (null !== $parent_folder) {
            $folder->setParent($parent_folder);
        }
        $folder->setName($name);

        $validation_errors = $validator->validate($folder);
        if (0 === count($validation_errors)) {
            $manager->persist($folder);
            $manager->flush();
            $serializer = new Serializer([$this->get('tg_file.normalizer')]);
            $new_folder = $serializer->normalize($folder);
        } else {
            foreach ($validation_errors as $error) {
                $errors[] = $error->getMessage();
            }
        }

        return new JsonResponse([
            'errors' => $errors,
            'new_folder' => $new_folder,
        ]);
    }

    /**
    * @param Folder $folder
    *
    * @return JsonResponse
    *
    * @Route("/delete/folder/{id}")
    * @Method({"DELETE"})
    */
    public function deleteAction(Folder $folder)
    {
        $manager = $this->getDoctrine()->getManager();
        $error = 'false';
        // may be check if the user has the right to delete this folder?
        $this->setTrashed($folder, $manager);
        $manager->flush();
        return new JsonResponse(['error' => $error]);
    }

    /**
     * @param Request $request
     * @param Folder  $folder
     *
     * @return JsonResponse
     *
     * @Route("/rename/folder/{id}", defaults={"id" = null})
     * @Method({"PUT"})
     */
     public function renameAction(Request $request, Folder $folder = null)
     {
        $name = $request->get('name');
        $validator = $this->get('validator');
        $manager = $this->getDoctrine()->getManager();
        $folder->setName($name);
        // $messages = ['oh het gaat mis', 'echt helemaal mis!'];
        $messages = [];

        $errors = $validator->validate($folder);
        if (0 === count($errors)) {
            $manager->persist($folder);
            $manager->flush();
         } else {
             foreach ($errors as $error) {
                 $messages = $error->getMessage();
             }
         }

         return new JsonResponse([
             'errors' => $messages,
         ]);
    }
}
