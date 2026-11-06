export function DottedX() {
  const dots = [];
  for (let row = -10; row <= 10; row++) {
    for (let col = -10; col <= 10; col++) {
      if (Math.min(Math.abs(col - row), Math.abs(col + row)) <= 2) {
        dots.push(<circle key={`${row}-${col}`} cx={col * 10 + 110} cy={row * 10 + 110} r="3.3" />);
      }
    }
  }
  return <div aria-hidden className="hero-poster"><svg className="hero-dotted-poster" viewBox="0 0 220 220">{dots}</svg></div>;
}