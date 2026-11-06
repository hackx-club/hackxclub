export function DottedX() {
  const dots = [];
  for (let row = -30; row <= 30; row++) {
    for (let col = -30; col <= 30; col++) {
      if (Math.min(Math.abs(col - row), Math.abs(col + row)) <= 6) {
        dots.push(<circle key={`${row}-${col}`} cx={col * (10 / 3) + 110} cy={row * (10 / 3) + 110} r="0.96" />);
      }
    }
  }
  return <div aria-hidden className="hero-poster"><svg className="hero-dotted-poster" viewBox="0 0 220 220">{dots}</svg></div>;
}