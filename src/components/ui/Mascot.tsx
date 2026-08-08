import Image from 'next/image';
import mascot from '../../../public/images/mascot-squirrel.png';

export function Mascot() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3) 0 4px' }}>
      <div className="mascot">
        <Image src={mascot} alt="Tutrice mascot" width={104} height={104} priority />
      </div>
    </div>
  );
}
