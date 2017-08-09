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

class FolderController extends Controller
{
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
        $messages = [];

        $folder = new Folder();
        if (null !== $parent_folder) {
            $folder->setParent($parent_folder);
        }
        $folder->setName($name);

        $errors = $validator->validate($folder);
        if (0 === count($errors)) {
            $manager->persist($folder);
            $manager->flush();
        } else {
            foreach ($errors as $error) {
                $messages = $error->getMessage();
            }
        }

        $serializer = new Serializer([$this->get('tg_file.normalizer')]);

        return new JsonResponse([
            'errors' => $messages,
            'new_folders' => $serializer->normalize([$folder]),
        ]);
    }

    /**
     * @param Folder $folder
     *
     * @return JsonResponse
     *
     * @Route("/delete/folder/{id}")
     * @Method({"POST"})
     */
    public function deleteAction(Folder $folder)
    {
        $manager = $this->getDoctrine()->getManager();
        $manager->remove($folder);
        $error = false;

        try {
            $manager->flush();
        } catch (ForeignKeyConstraintViolationException $e) {
            $error = true;
        }

        return new JsonResponse(['error' => $error]);
    }
}
