<?php

namespace Database\Seeders;

use App\Models\Bug;
use App\Models\Project;
use App\Models\TestCase;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestCaseSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Ensure Required Users Exist
        |--------------------------------------------------------------------------
        */

        $admin = User::firstOrCreate(
            ['email' => 'admin@bugtracker.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'department' => null,
            ]
        );

        $tester = User::firstOrCreate(
            ['email' => 'tester@bugtracker.com'],
            [
                'name' => 'Tester',
                'password' => Hash::make('password123'),
                'role' => 'tester',
                'department' => null,
            ]
        );

        $mohan = User::where('email', 'mohan@bugtracker.com')->first();
        $selvam = User::where('email', 'selvam@bugtracker.com')->first();
        $murali = User::where('email', 'murali@bugtracker.com')->first();
        $seetha = User::where('email', 'seetha@bugtracker.com')->first();

        $developers = array_values(array_filter([$mohan, $selvam, $murali, $seetha]));

        if (empty($developers)) {
            $developers = [$admin];
        }

        /*
        |--------------------------------------------------------------------------
        | Fetch All Products / Projects
        |--------------------------------------------------------------------------
        */

        $projects = Project::all();

        if ($projects->isEmpty()) {
            $defaultProjects = [
                [
                    'name' => 'AI Prep',
                    'description' => 'AI-based interview preparation platform.',
                ],
                [
                    'name' => 'Resume Analyzer',
                    'description' => 'Application for analyzing resumes and ATS scores.',
                ],
                [
                    'name' => 'E-Commerce Platform',
                    'description' => 'Online shopping and product management platform.',
                ],
            ];

            foreach ($defaultProjects as $p) {
                Project::create([
                    'name' => $p['name'],
                    'description' => $p['description'],
                    'status' => 'active',
                    'created_by' => $admin->id,
                ]);
            }

            $projects = Project::all();
        }

        /*
        |--------------------------------------------------------------------------
        | Test Cases Catalog with Nested Bugs per Product
        |--------------------------------------------------------------------------
        */

        $catalog = [
            'AI Prep' => [
                [
                    'test_case_code' => 'TC-AIP-001',
                    'title' => 'Verify AI Speech-to-Text Transcription in Mock Interview',
                    'module' => 'Audio Engine',
                    'type' => 'functional',
                    'priority' => 'high',
                    'severity' => 'high',
                    'status' => 'failed',
                    'preconditions' => 'User is authenticated and microphone permission is granted in browser.',
                    'steps' => "1. Navigate to Mock Interview Room.\n2. Click 'Start Answer' and speak into microphone.\n3. Click 'Finish Answer'.\n4. Inspect live transcript container.",
                    'expected_result' => 'Speech should be converted to text in real-time with over 95% word accuracy.',
                    'actual_result' => 'Transcription intermittently drops sentence endings when audio amplitude drops.',
                    'bugs' => [
                        [
                            'title' => 'Speech-to-text drops words during low audio volume',
                            'description' => 'When candidate speaks quietly at sentence endings, the websocket streaming drops last 3-4 words.',
                            'expected_result' => 'Full audio stream should be buffered and transcribed accurately.',
                            'actual_result' => 'Audio buffer truncates words below -24dB volume threshold.',
                            'assigned_team' => 'backend',
                            'assigned_to' => $mohan?->name ?? 'Mohan',
                            'severity' => 'high',
                            'priority' => 'high',
                            'status' => 'assigned',
                        ],
                        [
                            'title' => 'Speech transcript box does not auto-scroll down on long answers',
                            'description' => 'Transcript element does not automatically scroll as new words appear during a 2-minute response.',
                            'expected_result' => 'Transcript container should smoothly autoscroll to the latest transcribed text.',
                            'actual_result' => 'Container scrollbar remains static at the top.',
                            'assigned_team' => 'frontend',
                            'assigned_to' => $murali?->name ?? 'Murali',
                            'severity' => 'medium',
                            'priority' => 'medium',
                            'status' => 'in_progress',
                        ],
                    ],
                ],
                [
                    'test_case_code' => 'TC-AIP-002',
                    'title' => 'Verify Candidate Evaluation Scoring & Radar Chart Breakdown',
                    'module' => 'Feedback Analytics',
                    'type' => 'functional',
                    'priority' => 'urgent',
                    'severity' => 'critical',
                    'status' => 'failed',
                    'preconditions' => 'Mock interview session has at least 3 completed answers.',
                    'steps' => "1. Complete 3 questions in interview room.\n2. Click 'Generate Score Report'.\n3. Review category scores and visual radar chart.",
                    'expected_result' => 'Scores are calculated out of 100 with category breakdowns (Clarity, Technical, Confidence) and interactive radar chart.',
                    'actual_result' => 'Score returns NaN when questions are skipped or audio duration is below 5 seconds.',
                    'bugs' => [
                        [
                            'title' => 'Score generator throws HTTP 500 when answer duration is under 5 seconds',
                            'description' => 'Skipping or submitting ultra-short answers causes division by zero in average answer length calculation.',
                            'expected_result' => 'System handles short answers gracefully and assigns minimum default score.',
                            'actual_result' => 'Server returns 500 Internal Server Error in /api/interviews/evaluate.',
                            'assigned_team' => 'backend',
                            'assigned_to' => $selvam?->name ?? 'Selvam',
                            'severity' => 'critical',
                            'priority' => 'urgent',
                            'status' => 'in_progress',
                        ],
                        [
                            'title' => 'Radar chart labels overlap on mobile screens below 420px',
                            'description' => 'Category labels on radar feedback widget collide and become unreadable on mobile viewports.',
                            'expected_result' => 'Radar chart adapts label font size and padding dynamically.',
                            'actual_result' => 'Labels collide with chart polygon points on small screens.',
                            'assigned_team' => 'frontend',
                            'assigned_to' => $seetha?->name ?? 'Seetha',
                            'severity' => 'medium',
                            'priority' => 'low',
                            'status' => 'pending',
                        ],
                    ],
                ],
                [
                    'test_case_code' => 'TC-AIP-003',
                    'title' => 'Verify Webcam Feed Rendering and Permissions Handling',
                    'module' => 'Video Streaming',
                    'type' => 'ui',
                    'priority' => 'medium',
                    'severity' => 'medium',
                    'status' => 'failed',
                    'preconditions' => 'Browser with camera device connected.',
                    'steps' => "1. Enter interview setup lobby.\n2. Choose video source dropdown.\n3. Check camera preview feed.",
                    'expected_result' => 'Webcam stream renders with 720p resolution and smooth frame rate.',
                    'actual_result' => 'Camera feed displays black box on Safari browsers.',
                    'bugs' => [
                        [
                            'title' => 'Camera feed shows black rectangle on Safari macOS',
                            'description' => 'WebRTC media constraints lack webkit autoplay inline attributes, resulting in black video element.',
                            'expected_result' => 'Camera video should render smoothly with playsinline enabled.',
                            'actual_result' => 'Black rectangle is shown without permission rejection notice.',
                            'assigned_team' => 'frontend',
                            'assigned_to' => $murali?->name ?? 'Murali',
                            'severity' => 'high',
                            'priority' => 'high',
                            'status' => 'assigned',
                        ],
                        [
                            'title' => 'No fallback banner displayed when camera permission is denied',
                            'description' => 'If candidate rejects browser camera access, app displays infinite loading spinner instead of friendly permission prompt.',
                            'expected_result' => 'Show helpful modal explaining how to re-enable camera in browser settings.',
                            'actual_result' => 'Infinite spinner blocks the UI permanently.',
                            'assigned_team' => 'frontend',
                            'assigned_to' => $seetha?->name ?? 'Seetha',
                            'severity' => 'medium',
                            'priority' => 'medium',
                            'status' => 'resolved',
                        ],
                    ],
                ],
            ],

            'Resume Analyzer' => [
                [
                    'test_case_code' => 'TC-RES-001',
                    'title' => 'Validate Resume Upload Parsing for PDF and DOCX formats',
                    'module' => 'Resume Upload & Parser',
                    'type' => 'functional',
                    'priority' => 'high',
                    'severity' => 'high',
                    'status' => 'failed',
                    'preconditions' => 'Valid PDF/DOCX resume file ready on local disk.',
                    'steps' => "1. Go to Resume Upload page.\n2. Drag and drop a multi-page PDF resume.\n3. Click 'Analyze Resume'.",
                    'expected_result' => 'File parses text within 5 seconds and extracts candidate contact details, experience, and education.',
                    'actual_result' => 'Files larger than 4MB fail with unhandled payload exception.',
                    'bugs' => [
                        [
                            'title' => 'Resume upload > 4MB fails without clear user error notification',
                            'description' => 'Uploading a 4.5MB PDF triggers Nginx 413 Payload Too Large and front-end displays raw network error.',
                            'expected_result' => 'Client-side file validator should reject files over 4MB with friendly toast alert.',
                            'actual_result' => 'Generic network failure toast with unformatted HTTP 413 error code.',
                            'assigned_team' => 'backend',
                            'assigned_to' => $mohan?->name ?? 'Mohan',
                            'severity' => 'high',
                            'priority' => 'high',
                            'status' => 'assigned',
                        ],
                        [
                            'title' => 'Multi-column PDF layout merges disparate section headers',
                            'description' => 'PDF parser reads 2-column resumes horizontally, merging work history with skills into corrupted strings.',
                            'expected_result' => 'Parser should detect column layout and segment sections correctly.',
                            'actual_result' => 'Job title and skill keywords get jumbled into single unparsed block.',
                            'assigned_team' => 'backend',
                            'assigned_to' => $selvam?->name ?? 'Selvam',
                            'severity' => 'high',
                            'priority' => 'urgent',
                            'status' => 'in_progress',
                        ],
                    ],
                ],
                [
                    'test_case_code' => 'TC-RES-002',
                    'title' => 'Verify ATS Keyword Match Calculation Against Job Description',
                    'module' => 'ATS Match Engine',
                    'type' => 'functional',
                    'priority' => 'urgent',
                    'severity' => 'critical',
                    'status' => 'failed',
                    'preconditions' => 'Candidate resume has been parsed successfully.',
                    'steps' => "1. Paste a sample Software Engineer job description in comparison field.\n2. Click 'Calculate ATS Match'.\n3. Review matching vs missing keywords checklist.",
                    'expected_result' => 'System returns ATS compatibility percentage and highlighted matched keywords.',
                    'actual_result' => 'Keyword matching algorithm is case-sensitive and ignores hyphenated tech stacks (e.g. Node-js).',
                    'bugs' => [
                        [
                            'title' => 'Case-sensitive ATS keyword matching gives false negative score',
                            'description' => "Searching for 'react' misses 'React.js' and 'REACT' in resume body.",
                            'expected_result' => 'Tokenization should normalize strings to lowercase and strip punctuation.',
                            'actual_result' => 'Exact string match fails for capitalized tech acronyms.',
                            'assigned_team' => 'backend',
                            'assigned_to' => $selvam?->name ?? 'Selvam',
                            'severity' => 'high',
                            'priority' => 'high',
                            'status' => 'assigned',
                        ],
                        [
                            'title' => 'Missing keywords modal search filter does not filter results',
                            'description' => 'Typing in the search box inside the Missing Keywords popup modal does not filter the list.',
                            'expected_result' => 'List filters instantly on keystroke in search input.',
                            'actual_result' => 'List remains static regardless of search query entered.',
                            'assigned_team' => 'frontend',
                            'assigned_to' => $murali?->name ?? 'Murali',
                            'severity' => 'low',
                            'priority' => 'medium',
                            'status' => 'pending',
                        ],
                    ],
                ],
                [
                    'test_case_code' => 'TC-RES-003',
                    'title' => 'Validate Downloadable Analysis PDF Report Export',
                    'module' => 'Report Generation',
                    'type' => 'ui',
                    'priority' => 'medium',
                    'severity' => 'medium',
                    'status' => 'failed',
                    'preconditions' => 'Resume analysis result page is loaded with scores.',
                    'steps' => "1. Click 'Export PDF Report' button in top toolbar.\n2. Wait for PDF generation dialog.\n3. Open downloaded PDF file.",
                    'expected_result' => 'Generated PDF matches screen layout with high-resolution vector charts.',
                    'actual_result' => 'PDF footer overlaps page 2 text and skills badges are clipped.',
                    'bugs' => [
                        [
                            'title' => 'Exported PDF report clips skills badges on page boundary',
                            'description' => 'CSS print break-inside avoid property missing on skill badge cards, causing horizontal cut across badges.',
                            'expected_result' => 'Badge grid breaks cleanly onto new page.',
                            'actual_result' => 'Badges are sliced horizontally across page 1 and page 2.',
                            'assigned_team' => 'frontend',
                            'assigned_to' => $seetha?->name ?? 'Seetha',
                            'severity' => 'medium',
                            'priority' => 'medium',
                            'status' => 'in_progress',
                        ],
                        [
                            'title' => 'Export PDF button lacks loading state during 8-second generation',
                            'description' => 'Users click export button multiple times because no spinner or disabled state appears.',
                            'expected_result' => 'Button should disable and display spinner until download begins.',
                            'actual_result' => 'Button remains clickable, triggering multiple simultaneous downloads.',
                            'assigned_team' => 'frontend',
                            'assigned_to' => $murali?->name ?? 'Murali',
                            'severity' => 'low',
                            'priority' => 'low',
                            'status' => 'resolved',
                        ],
                    ],
                ],
            ],

            'E-Commerce Platform' => [
                [
                    'test_case_code' => 'TC-ECOMM-001',
                    'title' => 'Verify Cart Item Add, Quantity Increment, and Discount Calculation',
                    'module' => 'Shopping Cart',
                    'type' => 'functional',
                    'priority' => 'urgent',
                    'severity' => 'critical',
                    'status' => 'failed',
                    'preconditions' => 'User is browsing product catalog with active inventory items.',
                    'steps' => "1. Select product and click 'Add to Cart'.\n2. Open cart drawer.\n3. Increase item quantity from 1 to 5.\n4. Apply 10% discount promo code.",
                    'expected_result' => 'Cart subtotal updates immediately and discount applies accurately to total.',
                    'actual_result' => 'Rapid clicking on quantity increase sends duplicate requests causing incorrect total.',
                    'bugs' => [
                        [
                            'title' => 'Rapid clicks on cart quantity plus icon creates race condition',
                            'description' => 'Rapidly clicking + button sends out-of-order API requests, resulting in mismatched cart count and total price.',
                            'expected_result' => 'Debounce quantity updates or disable button during pending API call.',
                            'actual_result' => 'Cart state becomes corrupted with inconsistent totals.',
                            'assigned_team' => 'frontend',
                            'assigned_to' => $murali?->name ?? 'Murali',
                            'severity' => 'high',
                            'priority' => 'urgent',
                            'status' => 'assigned',
                        ],
                        [
                            'title' => 'Coupon code discount calculation ignores cents rounding',
                            'description' => 'Applying percentage coupon creates floating point rounding discrepancy ($19.999 instead of $20.00).',
                            'expected_result' => 'Amounts should be rounded to 2 decimal places using standard financial round-half-up.',
                            'actual_result' => 'Payment gateway throws invalid cents error during checkout.',
                            'assigned_team' => 'backend',
                            'assigned_to' => $mohan?->name ?? 'Mohan',
                            'severity' => 'critical',
                            'priority' => 'urgent',
                            'status' => 'in_progress',
                        ],
                    ],
                ],
                [
                    'test_case_code' => 'TC-ECOMM-002',
                    'title' => 'Verify Stripe Checkout Gateway and Order Confirmation Webhook',
                    'module' => 'Checkout & Payment',
                    'type' => 'integration',
                    'priority' => 'urgent',
                    'severity' => 'critical',
                    'status' => 'failed',
                    'preconditions' => 'Shopping cart has at least 1 item ready for checkout.',
                    'steps' => "1. Proceed to Checkout page.\n2. Enter shipping address and test credit card details.\n3. Click 'Pay Now'.\n4. Verify confirmation receipt email and order table record.",
                    'expected_result' => 'Payment processes successfully, redirects to Thank You page, and marks order paid via webhook.',
                    'actual_result' => 'Payment webhook hangs when customer billing address contains unicode symbols.',
                    'bugs' => [
                        [
                            'title' => 'Stripe webhook signature verification fails on unicode payload',
                            'description' => 'Raw request body encoding mismatch causes webhook verification failure on international addresses.',
                            'expected_result' => 'Webhook handler processes UTF-8 payload correctly and updates order status.',
                            'actual_result' => 'Webhook returns HTTP 400 Bad Signature and order remains pending.',
                            'assigned_team' => 'backend',
                            'assigned_to' => $selvam?->name ?? 'Selvam',
                            'severity' => 'critical',
                            'priority' => 'urgent',
                            'status' => 'assigned',
                        ],
                        [
                            'title' => 'Checkout page back button after payment causes duplicate charge warning',
                            'description' => "Clicking browser back button from receipt page re-submits POST checkout request.",
                            'expected_result' => 'Receipt page should use PRG (Post-Redirect-Get) pattern to avoid re-submission.',
                            'actual_result' => 'Browser displays form re-submission confirmation prompt.',
                            'assigned_team' => 'frontend',
                            'assigned_to' => $seetha?->name ?? 'Seetha',
                            'severity' => 'medium',
                            'priority' => 'high',
                            'status' => 'pending',
                        ],
                    ],
                ],
                [
                    'test_case_code' => 'TC-ECOMM-003',
                    'title' => 'Verify Product Catalog Multi-facet Filters and Price Slider',
                    'module' => 'Product Catalog',
                    'type' => 'ui',
                    'priority' => 'medium',
                    'severity' => 'medium',
                    'status' => 'failed',
                    'preconditions' => 'Product catalog has multiple categories, brands, and price tiers.',
                    'steps' => "1. Navigate to /products.\n2. Filter by Category: 'Electronics' and Brand: 'Sony'.\n3. Adjust price slider between $100 and $500.",
                    'expected_result' => 'Product grid updates via instant AJAX call without full page refresh.',
                    'actual_result' => 'URL query string clears previous brand filter when price slider moves.',
                    'bugs' => [
                        [
                            'title' => 'Price range slider overrides active category and brand filters',
                            'description' => 'Changing price slider replaces search URL query params instead of merging them.',
                            'expected_result' => 'Price filter should preserve selected category, brand, and sorting parameters.',
                            'actual_result' => 'Selected checkboxes reset when price slider handle is released.',
                            'assigned_team' => 'frontend',
                            'assigned_to' => $murali?->name ?? 'Murali',
                            'severity' => 'medium',
                            'priority' => 'medium',
                            'status' => 'in_progress',
                        ],
                        [
                            'title' => 'Empty search state shows broken image placeholder',
                            'description' => 'When filter returns zero matching products, no-results illustration has a broken img src link.',
                            'expected_result' => 'Clean empty state icon with button to reset all filters.',
                            'actual_result' => 'Broken image placeholder icon is rendered in empty state card.',
                            'assigned_team' => 'frontend',
                            'assigned_to' => $seetha?->name ?? 'Seetha',
                            'severity' => 'low',
                            'priority' => 'low',
                            'status' => 'resolved',
                        ],
                    ],
                ],
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Iterate Over Every Product/Project and Seed Test Cases + Multiple Bugs
        |--------------------------------------------------------------------------
        */

        $totalTestCasesCreated = 0;
        $totalBugsCreated = 0;

        foreach ($projects as $project) {
            $projectName = $project->name;

            // Retrieve predefined test cases or generate standard QA test cases
            $testCaseSpecs = $catalog[$projectName] ?? [
                [
                    'test_case_code' => 'TC-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $projectName), 0, 4)) . '-001',
                    'title' => 'Verify User Authentication and RBAC Permissions for ' . $projectName,
                    'module' => 'Authentication',
                    'type' => 'functional',
                    'priority' => 'high',
                    'severity' => 'high',
                    'status' => 'failed',
                    'preconditions' => 'Standard user account and admin account exist.',
                    'steps' => "1. Log in with standard user credentials.\n2. Attempt navigating to restricted admin endpoints.\n3. Validate HTTP status response.",
                    'expected_result' => 'Standard user should be denied access with HTTP 403 Forbidden.',
                    'actual_result' => 'Unauthorized users can access some admin routes without token checks.',
                    'bugs' => [
                        [
                            'title' => 'Unauthorized access permitted to settings endpoint in ' . $projectName,
                            'description' => 'Role middleware is missing on the settings update API route.',
                            'expected_result' => 'Only Admin role can access and update settings.',
                            'actual_result' => 'Any authenticated user can update system settings.',
                            'assigned_team' => 'backend',
                            'assigned_to' => $mohan?->name ?? 'Mohan',
                            'severity' => 'critical',
                            'priority' => 'urgent',
                            'status' => 'assigned',
                        ],
                        [
                            'title' => 'Session does not timeout after inactivity in ' . $projectName,
                            'description' => 'Token remains valid indefinitely even after long idle periods.',
                            'expected_result' => 'Session should prompt user to refresh after 30 minutes of inactivity.',
                            'actual_result' => 'Session remains active without expiration notice.',
                            'assigned_team' => 'backend',
                            'assigned_to' => $selvam?->name ?? 'Selvam',
                            'severity' => 'medium',
                            'priority' => 'medium',
                            'status' => 'in_progress',
                        ],
                    ],
                ],
                [
                    'test_case_code' => 'TC-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $projectName), 0, 4)) . '-002',
                    'title' => 'Verify Responsive Layout & Mobile Navigation for ' . $projectName,
                    'module' => 'User Interface',
                    'type' => 'ui',
                    'priority' => 'medium',
                    'severity' => 'medium',
                    'status' => 'failed',
                    'preconditions' => 'Web browser resized to mobile viewport (375px width).',
                    'steps' => "1. Open application on viewport width 375px.\n2. Tap hamburger menu icon.\n3. Select navigation links.",
                    'expected_result' => 'Hamburger drawer slides in smoothly and all menu links are clickable.',
                    'actual_result' => 'Drawer overlaps sticky header and menu button becomes unresponsive.',
                    'bugs' => [
                        [
                            'title' => 'Hamburger menu button unresponsive on mobile viewport for ' . $projectName,
                            'description' => 'Click event listener is detached after orientation change on mobile view.',
                            'expected_result' => 'Menu opens and closes reliably regardless of orientation.',
                            'actual_result' => 'Button clicks do not toggle drawer state.',
                            'assigned_team' => 'frontend',
                            'assigned_to' => $murali?->name ?? 'Murali',
                            'severity' => 'high',
                            'priority' => 'high',
                            'status' => 'assigned',
                        ],
                        [
                            'title' => 'Horizontal scroll bar appears on iPhone Safari for ' . $projectName,
                            'description' => 'Container with 100vw width exceeds screen causing unwanted horizontal scrolling.',
                            'expected_result' => 'Layout fits exactly within 100% viewport width without horizontal scroll.',
                            'actual_result' => 'Page scrolls horizontally by approximately 20px.',
                            'assigned_team' => 'frontend',
                            'assigned_to' => $seetha?->name ?? 'Seetha',
                            'severity' => 'medium',
                            'priority' => 'low',
                            'status' => 'resolved',
                        ],
                    ],
                ],
                [
                    'test_case_code' => 'TC-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $projectName), 0, 4)) . '-003',
                    'title' => 'Verify Data Export and CSV Generation for ' . $projectName,
                    'module' => 'Reporting',
                    'type' => 'functional',
                    'priority' => 'medium',
                    'severity' => 'medium',
                    'status' => 'failed',
                    'preconditions' => 'Database contains at least 20 records.',
                    'steps' => "1. Go to Reports tab.\n2. Select date range.\n3. Click 'Export to CSV'.",
                    'expected_result' => 'CSV file downloads with UTF-8 encoding and correctly formatted headers.',
                    'actual_result' => 'Special characters in exported CSV appear as garbled symbols.',
                    'bugs' => [
                        [
                            'title' => 'CSV export encoding displays mojibake characters in ' . $projectName,
                            'description' => 'CSV file lacks UTF-8 BOM, causing Excel to open file with incorrect character encoding.',
                            'expected_result' => 'CSV includes UTF-8 BOM byte header so Excel displays special characters accurately.',
                            'actual_result' => 'Accented letters and symbols are corrupted into question marks.',
                            'assigned_team' => 'backend',
                            'assigned_to' => $mohan?->name ?? 'Mohan',
                            'severity' => 'medium',
                            'priority' => 'medium',
                            'status' => 'pending',
                        ],
                        [
                            'title' => 'Date filter validation accepts invalid start date in ' . $projectName,
                            'description' => 'Selecting a start date after end date triggers unhandled SQL syntax exception.',
                            'expected_result' => 'Validation error should notify user that start date must precede end date.',
                            'actual_result' => 'Server returns 500 error when start date > end date.',
                            'assigned_team' => 'backend',
                            'assigned_to' => $selvam?->name ?? 'Selvam',
                            'severity' => 'high',
                            'priority' => 'high',
                            'status' => 'in_progress',
                        ],
                    ],
                ],
            ];

            foreach ($testCaseSpecs as $tcIndex => $tcSpec) {
                // Check if test case already exists for this project by code or title
                $testCase = TestCase::firstOrCreate(
                    [
                        'project_id' => $project->id,
                        'test_case_code' => $tcSpec['test_case_code'],
                    ],
                    [
                        'title' => $tcSpec['title'],
                        'module' => $tcSpec['module'] ?? 'Core',
                        'description' => $tcSpec['description'] ?? 'Test case for ' . $project->name,
                        'preconditions' => $tcSpec['preconditions'] ?? null,
                        'steps' => $tcSpec['steps'] ?? null,
                        'expected_result' => $tcSpec['expected_result'] ?? null,
                        'actual_result' => $tcSpec['actual_result'] ?? null,
                        'type' => $tcSpec['type'] ?? 'functional',
                        'priority' => $tcSpec['priority'] ?? 'medium',
                        'severity' => $tcSpec['severity'] ?? 'medium',
                        'status' => $tcSpec['status'] ?? 'pending',
                        'created_by' => $tester->id,
                    ]
                );

                $totalTestCasesCreated++;

                // Seed Multiple Bugs for this specific Test Case
                foreach ($tcSpec['bugs'] as $bugIndex => $bugSpec) {
                    // Check if this bug already exists for this test case
                    $existingBug = Bug::where('project_id', $project->id)
                        ->where('test_case_id', $testCase->id)
                        ->where('title', $bugSpec['title'])
                        ->first();

                    if (!$existingBug) {
                        Bug::create([
                            'project_id' => $project->id,
                            'test_case_id' => $testCase->id,
                            'reported_by' => $tester->name,
                            'assigned_to' => $bugSpec['assigned_to'],
                            'assigned_team' => $bugSpec['assigned_team'],
                            'title' => $bugSpec['title'],
                            'description' => $bugSpec['description'],
                            'expected_result' => $bugSpec['expected_result'] ?? $testCase->expected_result,
                            'actual_result' => $bugSpec['actual_result'] ?? $testCase->actual_result,
                            'image' => null,
                            'url' => 'https://example.com/' . strtolower(str_replace(' ', '-', $project->name)),
                            'severity' => $bugSpec['severity'] ?? 'medium',
                            'priority' => $bugSpec['priority'] ?? 'medium',
                            'status' => $bugSpec['status'] ?? 'assigned',
                            'resolved_at' => in_array($bugSpec['status'] ?? '', ['resolved', 'closed'])
                                ? Carbon::now()->subDays($bugIndex + 1)
                                : null,
                            'created_at' => Carbon::now()->subDays($tcIndex * 2 + $bugIndex),
                            'updated_at' => Carbon::now()->subDays($tcIndex * 2 + $bugIndex),
                        ]);
                        $totalBugsCreated++;
                    }
                }
            }

            // Link any pre-existing unlinked bugs for this project to the first test case
            $firstTestCase = $project->testCases()->first();
            if ($firstTestCase) {
                Bug::where('project_id', $project->id)
                    ->whereNull('test_case_id')
                    ->update(['test_case_id' => $firstTestCase->id]);
            }
        }

        $this->command->info(
            "Successfully seeded test cases and bugs: {$totalTestCasesCreated} test cases processed across " .
            $projects->count() . " products/projects, {$totalBugsCreated} new linked bugs created."
        );
    }
}
