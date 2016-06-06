<?php

namespace TweedeGolf\FileBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Validator\ConstraintViolation;
use TweedeGolf\FileBundle\Entity\File;
use TweedeGolf\FileBundle\Entity\Folder;

/**
 * Class UploadController.
 *
 * @Route("/admin/file")
 */
class UploadController extends Controller
{
    /**
     * @Route("/upload/{id}", defaults={"id" = null})
     *
     * @param Folder  $folder
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function uploadAction(Request $request, Folder $folder = null)
    {
        $error_list = [];
        $upload_list = [];

        if ($request->isMethod('POST')) {
            $em = $this->getDoctrine()->getManager();
            $validator = $this->get('validator');
            $translator = $this->get('translator');
            $serializer = new Serializer([$this->get('tg_file.normalizer')]);

            /** @var UploadedFile $uploaded_file */
            foreach ($request->files as $uploaded_file) {
                $file = new File();
                $file->setFile($uploaded_file);
                $file->setSize($uploaded_file->getSize());
                if (null !== $folder) {
                    $file->setFolder($folder);
                }
                $errors = $validator->validate($file);

                if (0 === count($errors)) {
                    $em->persist($file);
                    $upload_list[] = $serializer->normalize($file);
                } else {
                    $name = $uploaded_file->getClientOriginalName();
                    $error_list[$name] = [];
                    /** @var ConstraintViolation $error */
                    foreach ($errors as $error) {
                        $error_list[$name][] = $translator->trans($error->getMessage());
                    }
                }
            }

            $em->flush();
        }

        return new JsonResponse([
            'errors' => $error_list,
            'uploads' => $upload_list,
        ]);
    }
}
