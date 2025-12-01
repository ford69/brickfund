import ProjectDetailClient from './ProjectDetailClient';

// Generate static params for the dynamic route
export async function generateStaticParams() {
  // Return the project IDs that should be statically generated
  // For now, we'll return the mock project IDs
  return [
    { id: '507f1f77bcf86cd799439011' },
    { id: '507f1f77bcf86cd799439012' },
    { id: '507f1f77bcf86cd799439013' },
  ];
}

interface ProjectDetailProps {
  params: {
    id: string;
  };
}

export default function ProjectDetail({ params }: ProjectDetailProps) {
  return <ProjectDetailClient projectId={params.id} />;
}