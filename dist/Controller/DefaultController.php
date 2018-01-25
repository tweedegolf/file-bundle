<?php

namespace TweedeGolf\FileBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller
{
    /**
     * @Route("/browser")
     */
    public function indexAction(Request $request)
    {
        $url = $this->get('tg_file.helper.api_url')->getApiUrl();

        return $this->render('TGFileBundle:Default:index.html.twig', [
            'templates' => $this->getParameter('tg_file.templates'),
            'api_url' => $url,
            'options' => [
                'language' => $this->getParameter('locale'),
            ]
        ]);
    }
}
