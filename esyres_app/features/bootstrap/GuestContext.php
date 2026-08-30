<?php

use Behat\Behat\Context\Context;

class GuestContext implements Context
{
    use BehatRuntime;
    use SharedFixtures;
    use GuestSteps;
}
