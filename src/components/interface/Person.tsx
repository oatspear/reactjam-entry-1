import person1 from '../../assets/person.png';
import person2 from '../../assets/person2.png';


interface PersonProps {
  which: number;
}


function Person({ which }: PersonProps): JSX.Element {
  if (which === 1) {
    return (
      <div className='person'>
        <img src={person1} />
      </div>
    )
  }

  if (which === 2) {
    return (
      <div className='person'>
        <img src={person2} />
      </div>
    )
  }

  return <></>
}

export default Person;
