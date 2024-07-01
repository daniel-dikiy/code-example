<?php

namespace App\Http\Controllers;

use Exception;
use App\Http\Requests\ResearchRequest;
use App\Models\Research;
use Illuminate\Support\Facades\DB;

class ResearchController extends Controller
{
    public function store(ResearchRequest $request)
    {
        $data = $request->all();

        try {
            DB::beginTransaction();

            $model = new Research();
            $model->fill($data);
            $model->save();

            DB::commit();
            return response('OK', 200);
        } catch (Exception $e) {
            DB::rollback();
            return response('Error Saving', 500);
        }
    }

    public function getModel($project_id)
    {
        return Research::where('project_id', $project_id)
            ->with('year')
            ->with('year.flz')
            ->first();
    }

    public function update(ResearchRequest $request, $project_id)
    {
        $data = $request->all();

        try {
            DB::beginTransaction();

            $model = Research::where('project_id', $project_id)
                ->first();
            $model->fill($data);
            $model->update();

            DB::commit();
            return response('OK', 200);
        } catch (Exception $e) {
            DB::rollback();
            return response('Error Updating', 500);
        }
    }

    public function destroy($project_id)
    {
        try {
            DB::beginTransaction();
            Research::where('project_id', $project_id)
                ->delete();
            DB::commit();
            return response('OK', 200);
        } catch (Exception $e) {
            DB::rollback();
            return response('Error Deleting', 500);
        }
    }
}
