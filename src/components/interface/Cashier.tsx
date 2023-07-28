import cashier from '../../assets/cashier.png';


interface CashierProps {
  className: string;
  handleClick: () => void;
}


function Cashier ({ className, handleClick }: CashierProps): JSX.Element {
  return (
    <div className={className} onClick={handleClick}>
      <img src={cashier} />
    </div>
  )
}


export default Cashier;
