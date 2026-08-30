<?php

use Behat\Gherkin\Node\PyStringNode;

trait OwnerSteps
{
    /**
     * @When I query salon hours
     */
    public function iQuerySalonHours(): void
    {
        $this->graphql($this->salonHoursQuery(), ['id' => (string) $this->salon->id]);
    }

    /**
     * @When I query salon services
     */
    public function iQuerySalonServices(): void
    {
        $this->graphql($this->salonServicesQuery(), ['id' => (string) $this->salon->id]);
    }

    /**
     * @When I create a salon service:
     */
    public function iCreateASalonService(PyStringNode $payload): void
    {
        $this->graphql($this->createServiceMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I create a salon service as a guest:
     */
    public function iCreateASalonServiceAsAGuest(PyStringNode $payload): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->createServiceMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I update the salon service:
     */
    public function iUpdateTheSalonService(PyStringNode $payload): void
    {
        $this->graphql($this->updateServiceMutation(), [
            'id' => (string) $this->service->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I query salon workers
     */
    public function iQuerySalonWorkers(): void
    {
        $this->graphql($this->salonWorkersQuery(), ['id' => (string) $this->salon->id]);
    }

    /**
     * @When I create a salon worker:
     */
    public function iCreateASalonWorker(PyStringNode $payload): void
    {
        $this->graphql($this->createWorkerMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I create a salon worker as a guest:
     */
    public function iCreateASalonWorkerAsAGuest(PyStringNode $payload): void
    {
        $this->iFetchTheCsrfCookie();
        $this->graphql($this->createWorkerMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I update the salon worker:
     */
    public function iUpdateTheSalonWorker(PyStringNode $payload): void
    {
        $this->graphql($this->updateWorkerMutation(), [
            'id' => (string) $this->worker->id,
            'input' => json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * @When I update salon hours with notice :hours:
     */
    public function iUpdateSalonHours(string $hours, PyStringNode $payload): void
    {
        $days = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $this->graphql($this->updateHoursMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => [
                'hours' => $days,
                'cancellationNoticeHours' => (int) $hours,
            ],
        ]);
    }

    /**
     * @When I update salon hours as a guest with notice :hours:
     */
    public function iUpdateAsGuest(string $hours, PyStringNode $payload): void
    {
        $this->iFetchTheCsrfCookie();
        $days = json_decode($payload->getRaw(), true, 512, JSON_THROW_ON_ERROR);
        $this->graphql($this->updateHoursMutation(), [
            'salonId' => (string) $this->salon->id,
            'input' => [
                'hours' => $days,
                'cancellationNoticeHours' => (int) $hours,
            ],
        ]);
    }

    /**
     * @Then the salon is closed every weekday
     */
    public function theSalonIsClosedEveryWeekday(): void
    {
        $this->assertNoGraphqlErrors();
        foreach ($this->graphql['data']['salon']['hours'] as $day) {
            $this->assertTrue($day['closed'], $day['weekday'].' should be closed');
        }
    }

    private function salonHoursQuery(): string
    {
        return <<<'GQL'
query Salon($id: ID!) {
  salon(id: $id) {
    id
    name
    cancellationNoticeHours
    hours {
      weekday
      closed
      opensAt
      closesAt
      breakStartsAt
      breakEndsAt
    }
  }
}
GQL;
    }

    private function updateHoursMutation(): string
    {
        return <<<'GQL'
mutation Update($salonId: ID!, $input: UpdateSalonHoursInput!) {
  updateSalonHours(salonId: $salonId, input: $input) {
    id
    cancellationNoticeHours
    hours {
      weekday
      closed
      opensAt
      closesAt
      breakStartsAt
      breakEndsAt
    }
  }
}
GQL;
    }

    private function salonServicesQuery(): string
    {
        return <<<'GQL'
query Salon($id: ID!) {
  salon(id: $id) {
    id
    services {
      id
      name
      category
      durationMinutes
      priceFeninga
    }
  }
}
GQL;
    }

    private function createServiceMutation(): string
    {
        return <<<'GQL'
mutation Create($salonId: ID!, $input: CreateSalonServiceInput!) {
  createSalonService(salonId: $salonId, input: $input) {
    id
    name
    category
    durationMinutes
    priceFeninga
  }
}
GQL;
    }

    private function updateServiceMutation(): string
    {
        return <<<'GQL'
mutation UpdateService($id: ID!, $input: UpdateSalonServiceInput!) {
  updateSalonService(id: $id, input: $input) {
    id
    name
    category
    durationMinutes
    priceFeninga
  }
}
GQL;
    }

    private function salonWorkersQuery(): string
    {
        return <<<'GQL'
query Salon($id: ID!) {
  salon(id: $id) {
    id
    workers {
      id
      name
    }
  }
}
GQL;
    }

    private function createWorkerMutation(): string
    {
        return <<<'GQL'
mutation CreateWorker($salonId: ID!, $input: CreateSalonWorkerInput!) {
  createSalonWorker(salonId: $salonId, input: $input) {
    id
    name
  }
}
GQL;
    }

    private function updateWorkerMutation(): string
    {
        return <<<'GQL'
mutation UpdateWorker($id: ID!, $input: UpdateSalonWorkerInput!) {
  updateSalonWorker(id: $id, input: $input) {
    id
    name
  }
}
GQL;
    }
}
