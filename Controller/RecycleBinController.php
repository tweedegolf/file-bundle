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

/**
 * Class FolderController.
 *
 * @Route("/admin/file")
 */
class RecycleBinController extends Controller
{
    /**
    * @param Folder $folder
    * @param Array $result
    *
    * @return Array
    */
    function getSubFolders($folder, $result) {
        $result[] = $folder;
        $sub_folders = $folder->getChildren();
        foreach ($sub_folders as $sub_folder) {
            $result = array_merge($result, $this->getSubFolders($sub_folder, []));
        }
        return $result;
    }

    /**
    * @param Folder $folder
    * @param Manager $manager
    * @param Array $errors
    *
    * @return Array
    */
    private function deleteFolderContents(Folder $folder, Manager $manager, Array $errors, Array $messages)
    {
        $files = $folder->getFiles();
        foreach ($files as $file) {
            $name = $file->getName();
            $folderName = $folder->getName();
            $manager->remove($file);
            try {
                $messages[] = "delete file '$name' in folder '$folderName'";
                $manager->flush();
            } catch (ForeignKeyConstraintViolationException $e) {
                $errors[] = "can not delete file '$name' in folder '$folderName'";
            }
        }

        $folders = $folder->getChildren();
        foreach ($folders as $folder) {
            $result = $this->deleteFolderContents($folder, $manager, [], []);
            $errors = array_merge($errors, $result['errors']);
            $messages = array_merge($messages, $result['messages']);
        }

        $manager->remove($folder);
        $folderName = $folder->getName();
        try {
            $messages[] = "delete folder '$folderName'";
            $manager->flush();
        } catch (ForeignKeyConstraintViolationException $e) {
            $errors[] = "can not delete folder '$folderName'";
        }

        return array(
            'errors' => $errors,
            'messages' => $messages,
        );
    }

    /**
    *
    * @return JsonResponse
    *
    * @Route("/recycle_bin")
    * @Method({"GET"})
    */
    public function getRecycleBinAction()
    {
        $isTrashed = array(
            'isTrashed' => true
        );
        $files = $this->getDoctrine()->getRepository('TGFileBundle:File')->findBy($isTrashed);
        $folders = $this->getDoctrine()->getRepository('TGFileBundle:Folder')->findBy($isTrashed);
        //@TODO: make rootfolder configurable!
        $rootFolder = null;

        $filteredFiles = [];
        foreach($files as $file) {
            $folder = $file->getFolder();
            //@TODO: make rootfolder configurable!
            if($folder === $rootFolder || $folder->getIsTrashed() === false) {
                $filteredFiles[] = $file;
            }
        }

        $filteredFolders = [];
        foreach($folders as $folder) {
            $parent = $folder->getParent();
            if($parent === $rootFolder || $parent->getIsTrashed() === false) {
                $filteredFolders[] = $folder;
            }
        }

        $serializer = new Serializer([$this->get('tg_file.normalizer')]);
        return new JsonResponse([
            'files' => $serializer->normalize($filteredFiles),
            'folders' => $serializer->normalize($filteredFolders),
        ]);
    }

    /**
    *
    * @return JsonResponse
    *
    * @Route("/recycle_bin/empty")
    * @Method({"DELETE"})
    */
    public function emptyRecycleBinAction()
    {
        $manager = $this->getDoctrine()->getManager();
        $errors = [];
        $messages = [];

        $isTrashed = array(
            'isTrashed' => true
        );

        $files = $this->getDoctrine()->getRepository('TGFileBundle:File')->findBy($isTrashed);
        $folders = $this->getDoctrine()->getRepository('TGFileBundle:Folder')->findBy($isTrashed);

        foreach($folders as $folder) {
            $result = $this->deleteFolderContents($folder, $manager, [], []);
            $errors = array_merge($errors, $result['errors']);
            $messages = array_merge($messages, $result['messages']);
        }

        foreach($files as $file) {
            $name = $file->getName();
            $folder = $file->getFolder();
            $folderName = $folder->getName();
            $manager->remove($file);
            try {
                $messages[] = "file '$name' in folder '$folderName'";
                $manager->flush();
            } catch (ForeignKeyConstraintViolationException $e) {
                $errors[] = "can not delete file '$name' in folder '$folderName'";
            }
        }

        // $serializer = new Serializer([$this->get('tg_file.normalizer')]);
        return new JsonResponse([
            'errors' => $errors,
            'messages' => $messages,
            // 'files' => $serializer->normalize($files),
            // 'folders' => $serializer->normalize($folders),
            // 'sub_folders' => $serializer->normalize($sub_folders),
        ]);
    }
}
