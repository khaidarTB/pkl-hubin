<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            StudentSeeder::class,
            IndustrySeeder::class,
            CompanySeeder::class,
            PklPeriodSeeder::class,
            PklApplicationSeeder::class,
            PlacementSeeder::class,
            AttendanceSeeder::class,
            JournalSeeder::class,
            AssessmentSeeder::class,
            VisitSeeder::class,
            VisitReportSeeder::class,
            DocumentTemplateSeeder::class,
            DocumentSeeder::class,
            DocumentVerificationSeeder::class,
            DocumentVerificationLogSeeder::class,
            DocumentationSeeder::class,
            NotificationSeeder::class,
            AiSeeder::class,
        ]);
    }
}
