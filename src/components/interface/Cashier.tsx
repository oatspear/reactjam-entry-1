import cashier from '../../assets/cashier.png';

function Cashier ({ className }) {
    return (
        <div className={className}>
            <img src={cashier} />
        </div>
    )
}

export default Cashier;