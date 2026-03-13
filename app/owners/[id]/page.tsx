import OwnerProfileClient from './OwnerProfileClient';

interface OwnerProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function OwnerProfilePage({ params }: OwnerProfilePageProps) {
  const { id } = await params;
  return <OwnerProfileClient ownerId={id} />;
}
