<?php

test('root route redirects to dashboard', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect('/dashboard');
});
