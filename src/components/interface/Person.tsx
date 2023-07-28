import person from '../../assets/person.png';

function Person ({ className, handleClick }) {
    return (
        <div className={className} onClick={handleClick}>
            <img src={person} />
        </div>
    )
}

export default Person;