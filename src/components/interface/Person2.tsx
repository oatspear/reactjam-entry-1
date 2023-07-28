import person from '../../assets/person2.png';

function Person2 ({ className, handleClick }) {
    return (
        <div className={className} onClick={handleClick}>
            <img src={person} />
        </div>
    )
}

export default Person2;