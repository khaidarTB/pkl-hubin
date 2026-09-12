export type Role = 'admin' | 'guru' | 'industri' | 'siswa';

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    student?: Student | null;
}

export interface Company {
    id: number;
    name: string;
    address: string;
    city?: string;
    phone?: string;
    email?: string;
    website?: string;
    industry_type?: string;
    logo?: string;
    description?: string;
    supervisor_name?: string;
    partnership_status: 'active' | 'inactive' | 'pending';
    student_quota: number;
    latitude?: number | null;
    longitude?: number | null;
    allowed_radius?: number | null;
    jam_masuk?: string | null;
    jam_keluar?: string | null;
    placements_count?: number;
}

export interface Student {
    id: number;
    user_id: number;
    nis: string;
    class: string;
    major: string;
    phone?: string;
    photo?: string;
    placement?: Placement;
    latestApplication?: PklApplication;
    user?: User;
}

export interface Industry {
    id: number;
    name: string;
    address: string;
    phone?: string;
    email?: string;
    supervisor_name?: string;
}

export interface PklPeriod {
    id: number;
    name: string;
    academic_year: string;
    start_date: string;
    end_date: string;
    status: 'upcoming' | 'active' | 'completed';
}

export interface PklApplication {
    id: number;
    student_id: number;
    company_id?: number;
    pkl_period_id?: number;
    company_name: string;
    company_address: string;
    field_of_work: string;
    desired_position: string;
    cv_file?: string;
    cover_letter_file?: string;
    additional_file?: string;
    status: 'draft' | 'submitted' | 'under_review' | 'revision' | 'approved' | 'rejected';
    revision_note?: string;
    rejection_reason?: string;
    reviewed_by?: number;
    reviewed_at?: string;
    submitted_at?: string;
    company?: Company;
    student?: Student;
    reviewer?: User;
}

export interface Placement {
    id: number;
    student_id: number;
    industry_id?: number;
    company_id?: number;
    pkl_application_id?: number;
    pkl_period_id?: number;
    school_supervisor_id?: number;
    industry_supervisor_id?: number;
    placed_by?: number;
    placed_at?: string;
    start_date: string;
    end_date: string;
    status: 'Belum Mulai' | 'Aktif' | 'Terlambat' | 'Selesai' | 'Bermasalah';
    student?: Student;
    company?: Company;
    industry?: Industry;
    schoolSupervisor?: User;
    industrySupervisor?: User;
}

export interface Visit {
    id: number;
    teacher_id: number;
    student_id: number;
    company_id: number;
    placement_id?: number;
    visit_date: string;
    visit_time?: string;
    purpose: string;
    notes?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    teacher?: User;
    student?: Student;
    company?: Company;
    placement?: Placement;
    report?: VisitReport;
    document?: Document;
}

export interface VisitReport {
    id: number;
    visit_id: number;
    student_condition?: string;
    attendance_status?: string;
    progress_notes?: string;
    obstacles?: string;
    industry_feedback?: string;
    recommendations?: string;
    photos?: string[];
}

export interface DocumentTemplate {
    id: number;
    name: string;
    description?: string;
    type: string;
    file_path?: string;
    placeholders?: string[];
}

export interface DocumentVerification {
    id: number;
    document_id: number;
    verification_code: string;
    verification_token: string;
    document_type: string;
    document_number: string;
    status: 'VALID' | 'REVOKED' | 'EXPIRED';
    verified_at?: string;
    revoked_at?: string;
    created_at?: string;
    updated_at?: string;
    document?: Document;
    logs?: DocumentVerificationLog[];
}

export interface DocumentVerificationLog {
    id: number;
    document_verification_id: number;
    verified_at: string;
    ip_address?: string;
    user_agent?: string;
}

export interface Document {
    id: number;
    template_id?: number;
    visit_id?: number;
    title: string;
    type: string;
    document_number?: string;
    generated_file_path?: string;
    data?: Record<string, any>;
    status: 'draft' | 'final' | 'revoked';
    created_by?: number;
    template?: DocumentTemplate;
    visit?: Visit;
    verification?: DocumentVerification;
}

export interface Documentation {
    id: number;
    title: string;
    caption?: string;
    company_id?: number;
    student_id?: number;
    photo_path: string;
    category: string;
    date?: string;
    is_approved: boolean;
    company?: Company;
    student?: Student;
}

export interface NotificationItem {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'danger';
    icon?: string;
    link?: string;
    is_read: boolean;
    created_at?: string;
}

export interface Attendance {
    id: number;
    student_id: number;
    date: string;
    check_in?: string;
    check_out?: string;
    latitude?: number;
    longitude?: number;
    location_address?: string;
    status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa';
    server_timestamp?: string;
    gps_accuracy?: number | null;
    company_latitude?: number | null;
    company_longitude?: number | null;
    distance_from_company?: number | null;
    allowed_radius?: number | null;
    location_status?: 'VERIFIED' | 'REJECTED' | 'OUTSIDE_RADIUS' | 'LOW_ACCURACY' | null;
    time_status?: 'ON_TIME' | 'LATE' | 'OUTSIDE_WORKING_HOURS' | null;
    check_out_server_timestamp?: string;
    check_out_latitude?: number | null;
    check_out_longitude?: number | null;
    check_out_gps_accuracy?: number | null;
    check_out_distance_from_company?: number | null;
    student?: Student;
}

export interface AttendanceAttempt {
    id: number;
    student_id: number;
    company_id?: number | null;
    server_timestamp: string;
    latitude: number;
    longitude: number;
    gps_accuracy?: number | null;
    company_latitude?: number | null;
    company_longitude?: number | null;
    distance_from_company?: number | null;
    allowed_radius?: number | null;
    result?: 'HADIR' | 'TERLAMBAT' | 'DITOLAK' | null;
    failure_reason?: string | null;
    notes?: string | null;
    student?: Student;
    company?: Company;
}

export interface Journal {
    id: number;
    student_id: number;
    date: string;
    activity: string;
    description: string;
    skill: string;
    obstacle?: string;
    solution?: string;
    status: 'Menunggu Approval' | 'Approved' | 'Revision';
    approved_by?: number;
    approved_at?: string;
    approved_signature?: string;
    approved_signature_url?: string | null;
    signature_ready?: boolean;
    revision_note?: string;
    student?: Student;
    approver?: User;
}

export interface AssessmentAspect {
    id: number;
    name: string;
    description?: string | null;
    max_score: number;
    min_score: number;
    sort_order: number;
    is_active: boolean;
    scores_count?: number;
}

export interface AssessmentAspectScore {
    id: number;
    assessment_id: number;
    assessment_aspect_id: number;
    score: number;
    aspect?: AssessmentAspect;
}

export interface Assessment {
    id: number;
    student_id: number;
    industry_supervisor_id?: number;
    discipline: number;
    responsibility: number;
    teamwork: number;
    communication: number;
    technical_skill: number;
    creativity: number;
    problem_solving: number;
    total_score: number;
    status?: 'LULUS' | 'BELUM';
    notes?: string;
    aspect_scores?: AssessmentAspectScore[];
    student?: Student;
    supervisor?: User;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success?: string;
        error?: string;
        message?: string;
    };
    waGatewayStatus?: string;
    [key: string]: any;
}
