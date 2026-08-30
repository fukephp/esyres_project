<?php

use Behat\Behat\Context\Context;

class OwnerContext implements Context
{
    use BehatRuntime;
    use SharedFixtures;
    use OwnerSteps;
}
