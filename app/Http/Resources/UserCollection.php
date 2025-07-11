<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request)
    {
        return $this->collection->map(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->roles,
            'photo' => $user->photo ? url()->route('image', ['path' => $user->photo, 'w' => 60, 'h' => 60, 'fit' => 'crop']) : null,
            'deleted_at' => $user->deleted_at,
        ]);
    }
}
