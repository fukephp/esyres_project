<?php

final class BehatKernel
{
    /** @var \Illuminate\Foundation\Application|null */
    public static $app = null;

    /** @var list<string>|null */
    public static ?array $tablesToTruncate = null;
}
