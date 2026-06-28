import { locales } from '../utils/locales';

const FlightStatus = ({ isGoodToFly, language }) => {
  const t = locales[language];

  return (
    <div className={`p-4 text-center font-bold text-2xl text-white ${isGoodToFly ? 'bg-emerald-700' : 'bg-red-700'}`}>
      {isGoodToFly ? t.goodToFly : t.notGoodToFly}
    </div>
  );
};

export default FlightStatus;