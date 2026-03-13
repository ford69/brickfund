import InvestorProfileClient from './InvestorProfileClient';

interface InvestorProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function InvestorProfilePage({ params }: InvestorProfilePageProps) {
  const { id } = await params;
  return <InvestorProfileClient investorId={id} />;
}
