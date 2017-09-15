<?php

namespace TweedeGolf\FileBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * Class DefaultController.
 *
 * @Route("/admin/file")
 */
class DefaultController extends Controller
{
    /**
     * @Route("/browser")
     */
    public function indexAction()
    {
        return $this->render('TGFileBundle:Default:index.html.twig', [
            'templates' => $this->getParameter('tg_file.templates'),
            'options' => [
                'language' => $this->getParameter('locale'),
                'allow_upload' => true,
                'allow_delete' => true,
                'allow_new_folder' => true,
                'allow_delete_folder' => true,
            ]
        ]);
    }
}
