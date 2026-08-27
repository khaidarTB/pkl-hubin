<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Placement extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'industry_id',
        'company_id',
        'pkl_application_id',
        'pkl_period_id',
        'school_supervisor_id',
        'industry_supervisor_id',
        'placed_by',
        'placed_at',
        'start_date',
        'end_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'placed_at' => 'datetime',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function industry()
    {
        return $this->belongsTo(Industry::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function application()
    {
        return $this->belongsTo(PklApplication::class, 'pkl_application_id');
    }

    public function period()
    {
        return $this->belongsTo(PklPeriod::class, 'pkl_period_id');
    }

    public function schoolSupervisor()
    {
        return $this->belongsTo(User::class, 'school_supervisor_id');
    }

    public function industrySupervisor()
    {
        return $this->belongsTo(User::class, 'industry_supervisor_id');
    }

    public function placer()
    {
        return $this->belongsTo(User::class, 'placed_by');
    }
}
