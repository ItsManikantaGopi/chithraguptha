export const profile = {
  name: "Manikanta Gopi",
  role: "Senior Software Engineer",
  tagline: "Backend, platform and infrastructure engineering.",
  location: "Hyderabad, India",
  description:
    "Backend systems and the infrastructure they run on — a Rails monolith, Go and NestJS services, and a GitOps-managed Kubernetes fleet across AWS, GCP and Azure.",
  intro: [
    "I build the parts of a product that have to stay up.",
    "For the last four years that has meant Praja — a regional social platform — where I've worked across a Ruby on Rails monolith, a set of Go and NestJS services around it, and the Kubernetes fleet all of it runs on. Along the way I've owned migrations, designed the release path, and shipped the infrastructure a paid tier depends on.",
    "I like the problems where the answer is a measurement rather than an opinion: which queue is actually the bottleneck, what the p90 really is, whether the new model is better or just different.",
  ],
  github: "https://github.com/ItsManikantaGopi",
  linkedin: "https://www.linkedin.com/in/manikanta-gopi-549163190",
  email: "manikantagopiw@gmail.com",
  blog: "https://itsmanikantagopi.github.io/PersonalBlog",
};

export const stats = [
  { value: "4 yrs", label: "back-end engineering", detail: "Dec 2021 → present" },
  { value: "24", label: "services on the fleet", detail: "GitOps-managed on AWS EKS" },
  { value: "3", label: "clouds worked across", detail: "AWS primary, GCP and Azure" },
  { value: "1", label: "zero-downtime migration", detail: "Azure AKS → AWS EKS, live cutover" },
];

export type Project = {
  slug: string;
  title: string;
  summary: string;
  period: string;
  stack: string[];
  kind: "Platform" | "Infrastructure" | "Backend" | "ML" | "Open source";
};

export const projects: Project[] = [
  {
    slug: "praja-platform",
    title: "The Rails monolith at the centre of a social platform",
    summary:
      "185 models, 211 background workers and ~28 Sidekiq queues serving a regional social network. Four years of feature work, performance work, and the discipline of keeping a large monolith habitable.",
    period: "2022 – present",
    stack: ["Ruby on Rails", "MySQL", "Redis", "Sidekiq", "OpenSearch"],
    kind: "Platform",
  },
  {
    slug: "gitops-fleet",
    title: "Running a 24-service fleet from a Git repository",
    summary:
      "Helm charts, per-environment values and automated image bumps describing every service in production. ~380 pull requests, most of them deliberately tiny.",
    period: "2024 – present",
    stack: ["Kubernetes", "Helm", "Flux", "ArgoCD", "KEDA", "Karpenter"],
    kind: "Infrastructure",
  },
  {
    slug: "realtime-messaging",
    title: "A real-time messaging service, and the parts that were hard",
    summary:
      "NestJS and Socket.IO with Redis pub/sub for cross-instance fan-out and MongoDB for persistence. ~340 pull requests over three years — including adding a message broker and later removing it.",
    period: "2023 – 2026",
    stack: ["NestJS", "Socket.IO", "Redis", "MongoDB", "BullMQ"],
    kind: "Backend",
  },
  {
    slug: "multi-cloud-migration",
    title: "Moving production from Azure to AWS, service by service",
    summary:
      "A live migration from AKS to EKS — Terraform for the new estate, one service at a time, DNS and CDN last, then a deliberate decommission. No maintenance window.",
    period: "2024 – 2025",
    stack: ["Terraform", "AWS EKS", "Azure AKS", "CloudFront", "Route 53"],
    kind: "Infrastructure",
  },
  {
    slug: "poster-video-pipeline",
    title: "The media pipeline behind the paid tier",
    summary:
      "Compositing user photography onto templated poster and video designs at festival-day volumes. Moved from Lambda + FFmpeg to KEDA-scaled in-cluster workers driven by queue depth.",
    period: "2024 – present",
    stack: ["NestJS", "FFmpeg", "Puppeteer", "Redis", "KEDA", "S3"],
    kind: "Backend",
  },
  {
    slug: "background-removal-ml",
    title: "Replacing a vendor vision API with a self-hosted GPU service",
    summary:
      "Background removal moved from per-call cloud API to an ONNX model on GPU nodes in-cluster, then a face-detector swap validated against 200 real production images before shipping.",
    period: "2025 – 2026",
    stack: ["Python", "ONNX Runtime", "OpenCV", "BiRefNet", "SCRFD"],
    kind: "ML",
  },
  {
    slug: "garuda-notifications",
    title: "A Go notification service for fan-out at population scale",
    summary:
      "Targeting users by district, state, party and circle, then dispatching push through FCM without touching the main API's request path.",
    period: "2024 – present",
    stack: ["Go", "Gin", "GORM", "Asynq", "Redis", "FCM"],
    kind: "Backend",
  },
  {
    slug: "ci-cd-and-observability",
    title: "The release path, and knowing when it broke",
    summary:
      "CircleCI with timing-based test splitting, build capacity on our own cluster, plus the instrumentation and backup drills that make production legible.",
    period: "2024 – present",
    stack: ["CircleCI", "New Relic", "Prometheus", "Grafana", "Loki", "Velero"],
    kind: "Infrastructure",
  },
  {
    slug: "seeker",
    title: "Seeker: a search engine built from first principles",
    summary:
      "An inverted index, BM25, Levenshtein automata, FSTs, BKD trees, a byte-level segment format and a breakable cluster — ~20,000 lines of TypeScript with a 43-chapter book.",
    period: "2026",
    stack: ["TypeScript", "Next.js", "React"],
    kind: "Open source",
  },
  {
    slug: "rails2x",
    title: "rails2x: translating Rails to Go through an AST",
    summary:
      "A migration engine that parses Ruby with tree-sitter, lifts it into a typed IR, and scaffolds Goravel code — with static gates that refuse to publish a partial tree.",
    period: "2026",
    stack: ["Go", "tree-sitter", "Ruby", "Goravel"],
    kind: "Open source",
  },
  {
    slug: "sidekiq-assured-jobs",
    title: "sidekiq-assured-jobs: not losing the job when the worker dies",
    summary:
      "A Ruby gem that tracks in-flight Sidekiq jobs and re-enqueues whatever a killed worker was holding, because Kubernetes evicts pods and Sidekiq does not remember what it lost.",
    period: "2025",
    stack: ["Ruby", "Sidekiq", "Redis", "RSpec"],
    kind: "Open source",
  },
];

export const roles = [
  {
    company: "Circleapp Online Services (Praja)",
    title: "Software Engineer II",
    period: "Apr 2025 – Present",
    summary:
      "Platform and infrastructure ownership alongside product work: the Kubernetes fleet, the media generation pipeline, and the release path everything ships through.",
    highlights: [
      "Own the GitOps repository describing ~24 services on the production AWS cluster — Helm charts, per-environment values, automated image bumps on merge.",
      "Built the in-cluster video poster pipeline that replaced a Lambda + FFmpeg design with KEDA-scaled workers driven by Redis queue depth.",
      "Moved CI to CircleCI with timing-based test splitting across parallel containers, and moved API, web and admin deploys onto the same path.",
      "Ran seasonal capacity planning for sharp, predictable festival-day traffic peaks.",
      "Took background removal from a hosted vendor API to a self-hosted ONNX GPU service in-cluster.",
    ],
    stack: ["Kubernetes", "Helm", "Terraform", "AWS", "KEDA", "Karpenter", "CircleCI", "Rails", "NestJS", "Go"],
  },
  {
    company: "Circleapp Online Services (Praja)",
    title: "Software Engineer",
    period: "May 2022 – Mar 2025",
    summary:
      "Backend feature work on the Rails monolith and the services around it, growing into the multi-cloud migration and the platform work that came with it.",
    highlights: [
      "Built and ran the real-time messaging service — NestJS, Socket.IO, Redis pub/sub fan-out, MongoDB persistence, BullMQ for deferred work.",
      "Led the migration of production from Azure AKS to AWS EKS: Terraform estate, service-by-service cutover, DNS and CDN moves, then decommission.",
      "Implemented the subscription lifecycle in the monolith — charge scheduling, grace periods, refunds, idempotent handling of duplicate gateway callbacks.",
      "Wrote the poster and video generation pipeline the paid tier is built on.",
      "Published sidekiq-assured-jobs.",
    ],
    stack: ["Ruby on Rails", "NestJS", "Socket.IO", "Redis", "MySQL", "MongoDB", "Sidekiq", "Terraform", "Flutter"],
  },
  {
    company: "Circleapp Online Services (Praja)",
    title: "Software Engineer Intern",
    period: "Dec 2021 – Apr 2022",
    summary: "Started on the Flutter client, then moved toward the API that fed it.",
    highlights: [
      "Shipped chat features in the Flutter app — conversation types, message deletion, link and post previews, member lists.",
      "Moved into the Rails API for the endpoints those features needed.",
    ],
    stack: ["Flutter", "Dart", "Ruby on Rails"],
  },
  {
    company: "Continual Engine",
    title: "Machine Learning Intern",
    period: "2021",
    summary: "Applied-ML internship on image understanding for accessibility tooling.",
    highlights: [
      "Built image-to-text models in PyTorch, including autoencoders for feature extraction.",
      "Ran the training loop and the evaluation that decided whether a change was an improvement.",
    ],
    stack: ["Python", "PyTorch", "NumPy"],
  },
];

export const skillGroups = [
  {
    name: "Languages",
    items: ["Ruby", "TypeScript", "Go", "Python", "Dart", "Bash", "SQL"],
  },
  {
    name: "Backend",
    items: ["Ruby on Rails", "NestJS", "Sidekiq", "BullMQ", "Socket.IO", "Asynq", "Gin + GORM", "REST API design"],
  },
  {
    name: "Data & storage",
    items: ["MySQL", "Redis", "MongoDB", "OpenSearch", "PostgreSQL", "S3"],
  },
  {
    name: "Infrastructure",
    items: ["Kubernetes", "Helm", "Terraform", "Docker", "KEDA", "Karpenter", "Flux / ArgoCD", "APISIX"],
  },
  {
    name: "Cloud",
    items: ["AWS", "GCP", "Azure"],
  },
  {
    name: "Delivery & observability",
    items: ["CircleCI", "GitHub Actions", "New Relic", "Prometheus + Grafana", "Loki", "Velero"],
  },
];

export const education = [
  {
    institution: "Rajiv Gandhi University of Knowledge Technologies",
    qualification: "B.Tech, Computer Science",
    year: "2022",
    detail: "GPA 9.3 / 10",
  },
];

export const writing = [
  { title: "What 1,700 pull requests look like", slug: "what-1700-pull-requests-look-like" },
  { title: "Scale on the queue, not the CPU", slug: "scale-on-the-queue-not-the-cpu" },
  { title: "A better model made the product worse", slug: "a-better-model-made-the-product-worse" },
  { title: "Scaling, and the bottleneck you moved", slug: "scaling-and-the-bottleneck-you-moved" },
  { title: "Services in Kubernetes", slug: "services-in-kubernetes" },
  { title: "Lessons from the first few years", slug: "lessons-from-the-first-few-years" },
];
