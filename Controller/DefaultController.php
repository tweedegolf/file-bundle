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
            'options' => [],
            'templates' => $this->getParameter('tg_file.templates'),
        ]);
    }
}
