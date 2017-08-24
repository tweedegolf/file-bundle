<?php

namespace TweedeGolf\FileBundle\Controller;

use Doctrine\DBAL\Exception\ForeignKeyConstraintViolationException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\Serializer;
use TweedeGolf\FileBundle\Entity\File;
use TweedeGolf\FileBundle\Entity\Folder;

/**
 * Class FileController.
 *
 * @Route("/admin/file")
 */
class FileController extends Controller
{
    /**
     * @param Folder  $folder
     * @param Request $request
     *
     * @return JsonResponse
     *
     * @Route("/move/{id}", defaults={"id" = null})
     */
    public function moveAction(Request $request, Folder $new_parent_folder = null)
    {
        $file_ids = $request->get('fileIds', []);
        $folder_ids = $request->get('folderIds', []);
        $files = $this->getDoctrine()->getRepository('TGFileBundle:File')->findById($file_ids);
        $folders = $this->getDoctrine()->getRepository('TGFileBundle:Folder')->findById($folder_ids);
        $error = 'false';
        $file_errors = [];
        $folder_errors = [];

        /** @var File $file */
        foreach ($files as $file) {
            $file->setIsTrashed(false);
            $file->setFolder($new_parent_folder);
        }

        /** @var Folder $folder */
        foreach ($folders as $folder) {
            $folder->setIsTrashed(false);
            $folder->setParent($new_parent_folder);
        }

        try {
            $this->getDoctrine()->getManager()->flush();
        } catch (Exception $error) {
            $error = $error.getMessage();
        }

        // $serializer = new Serializer([$this->get('tg_file.normalizer')]);
        return new JsonResponse([
            'error' => $error,
            'file_errors' => $file_errors,
            'folder_errors' => $folder_errors,
            // 'files' => $serializer->normalize($files),
            // 'folders' => $serializer->normalize($folders),
        ]);
    }

    /**
     * @param File $file
     *
     * @return JsonResponse
     *
     * @Route("/delete/{id}")
     * @Method({"POST"})
     */
    public function deleteAction(File $file)
    {
        $manager = $this->getDoctrine()->getManager();
        $error = 'false';
        $file->setIsTrashed(true);
        $manager->persist($file);
        $manager->flush();
        return new JsonResponse(['error' => $error]);
    }

    /**
     * @param File $file
     *
     * @Route("/download/{id}", name="tg_file_download")
     * @return Response
     */
    public function downloadAction(File $file)
    {
        $fs = $this->container->get('oneup_flysystem.mount_manager')->getFilesystem('media_fs');
        $name = $file->getName();

        return new Response($fs->read($name), 200, [
            'Cache-Control', 'private',
            'Content-Type' => $fs->getMimetype($name),
            'Content-Disposition' => 'attachment; filename="' . $file->getOriginalName() . '";',
            'Content-length' => $fs->getSize($name),
        ]);
    }

    /**
    * @param Request $request
    *
    * @Route("/metadata")
    * @Method({"POST"})
    * @return JsonResponse
    */
    public function metadataAction(Request $request)
    {
        $file_ids = $request->get('fileIds', []);
        $folder_ids = $request->get('folderIds', []);
        $files = $this->getDoctrine()->getRepository('TGFileBundle:File')->findById($file_ids);
        $folders = $this->getDoctrine()->getRepository('TGFileBundle:Folder')->findById($folder_ids);

        $serializer = new Serializer([$this->get('tg_file.normalizer')]);
        return new JsonResponse([
            'files' => $serializer->normalize($files),
            'folders' => $serializer->normalize($folders),
        ]);
    }
}
