import cashier from '../../assets/cashier.png';


interface CashierProps {
  handleClick: (e: React.MouseEvent | React.TouchEvent) => void;
}


function Cashier ({ handleClick }: CashierProps): JSX.Element {
  return (
    <div className="cashier">
      <img src={cashier} className='animate__animated animate__pulse' onClick={handleClick} />
    </div>
  )
}


export default Cashier;
