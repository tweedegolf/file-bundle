<?php

namespace TweedeGolf\FileBundle\Util;

class SizeHumanizer
{
    /**
     * @var array
     */
    const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    /**
     * Humanize a file size.
     *
     * @param int $size
     * @param int $precision
     *
     * @return string
     */
    public static function human($size, $precision = 1)
    {
        $step = 1024;
        $i = 0;
        while (($size / $step) > 0.9) {
            $size = $size / $step;
            $i += 1;
        }

        return round($size, $precision).' '.self::UNITS[$i];
    }
}
