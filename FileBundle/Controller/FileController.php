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
    public function indexAction(Request $request, Folder $folder = null)
    {
        $file_ids = $request->get('files', []);
        $files = $this->getDoctrine()->getRepository('TGFileBundle:File')->findById($file_ids);

        /** @var File $file */
        foreach ($files as $file) {
            $file->setFolder($folder);
        }

        $this->getDoctrine()->getManager()->flush();
        $serializer = new Serializer([$this->get('tg_file.normalizer')]);

        return new JsonResponse([
            'files' => $serializer->normalize($files),
        ]);
    }

    /**
     * @param File $file
     *
     * @return JsonResponse
     *
     * @Route("/{id}/delete")
     * @Method({"POST"})
     */
    public function deleteAction(File $file)
    {
        $manager = $this->getDoctrine()->getManager();
        $manager->remove($file);
        $error = false;

        try {
            $manager->flush();
        } catch (ForeignKeyConstraintViolationException $e) {
            $error = true;
        }

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
}
