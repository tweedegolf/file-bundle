<?php

namespace TweedeGolf\FileBundle\Helper;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class ApiUrlHelper implements ApiUrlHelperInterface
{
    /**
     * @var UrlGeneratorInterface
     */
    private $urlGenerator;

    /**
     * @var RequestStack
     */
    private $requestStack;

    public function __construct(UrlGeneratorInterface $urlGenerator, RequestStack $requestStack)
    {
        $this->urlGenerator = $urlGenerator;
        $this->requestStack = $requestStack;
    }

    /**
     * @return string
     */
    public function getApiUrl()
    {
        $fullUrl = $this->urlGenerator->generate(
            'tweedegolf_file_default_index',
            $this->requestStack->getCurrentRequest()->attributes->all(),
            UrlGeneratorInterface::ABSOLUTE_URL
        );

        $parsedUrl = parse_url($fullUrl);
        $port = isset($parsedUrl['port']) ? ":{$parsedUrl['port']}" : '';
        $path = preg_replace('#/browser/?$#i', '', $parsedUrl['path']);
        $url = "//{$parsedUrl['host']}{$port}{$path}";

        return $url;
    }
}
