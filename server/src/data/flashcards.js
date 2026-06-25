module.exports = [
  // ARITHMETIC
  {cat:'Arithmetic',term:'Divisibility by 3',def:'A number is divisible by 3 if the sum of its digits is divisible by 3. Example: 132 → 1+3+2=6 ✓'},
  {cat:'Arithmetic',term:'Divisibility by 9',def:'A number is divisible by 9 if the sum of its digits is divisible by 9. Example: 729 → 7+2+9=18 ✓'},
  {cat:'Arithmetic',term:'LCM & GCF',def:'LCM(a,b) = (a×b) / GCF(a,b). To find GCF, use prime factorization and take the lowest power of common factors.'},
  {cat:'Arithmetic',term:'Prime Numbers < 30',def:'2, 3, 5, 7, 11, 13, 17, 19, 23, 29\n(10 primes. Remember: 1 is NOT prime)'},
  {cat:'Arithmetic',term:'Percent Change',def:'% Change = (New − Old) / Old × 100\nPercent decrease is negative. "Increased by 20% then decreased by 20%" ≠ original.'},
  {cat:'Arithmetic',term:'Compound Interest',def:'A = P(1 + r/n)^(nt)\nP=principal, r=annual rate, n=compounds/year, t=years\nSimple interest: A = P(1 + rt)'},
  {cat:'Arithmetic',term:'Ratio & Proportion',def:'If a:b = c:d, then ad = bc (cross multiply). Parts of a whole: if ratio is a:b, parts are a/(a+b) and b/(a+b).'},
  // ALGEBRA
  {cat:'Algebra',term:'Quadratic Formula',def:'x = (−b ± √(b²−4ac)) / 2a\nfor ax²+bx+c=0\nDiscriminant: b²−4ac > 0 → 2 real roots; =0 → 1 root; <0 → no real roots'},
  {cat:'Algebra',term:'FOIL & Factoring',def:'(a+b)² = a²+2ab+b²\n(a−b)² = a²−2ab+b²\n(a+b)(a−b) = a²−b²\nAlways look for difference of squares first!'},
  {cat:'Algebra',term:'Absolute Value Inequalities',def:'|x| < a → −a < x < a\n|x| > a → x < −a OR x > a\n|x−k| < d means "within d of k"'},
  {cat:'Algebra',term:'Systems of Equations',def:'Substitution: solve for one variable, substitute.\nElimination: add/subtract equations to cancel a variable.\nIf 0=0, infinite solutions. If 0=5, no solution.'},
  {cat:'Algebra',term:'Exponent Rules',def:'aᵐ·aⁿ = aᵐ⁺ⁿ\naᵐ/aⁿ = aᵐ⁻ⁿ\n(aᵐ)ⁿ = aᵐⁿ\na⁰ = 1\na⁻ⁿ = 1/aⁿ\n(ab)ⁿ = aⁿbⁿ'},
  {cat:'Algebra',term:'Function Notation',def:'f(x): input x, output f(x). f(a+b) means substitute (a+b) for x everywhere. Composite: f(g(x)) — apply g first, then f.'},
  {cat:'Algebra',term:'Inequalities',def:'Flip the sign when multiplying/dividing by a negative number.\nDo NOT flip when adding/subtracting.\n−3x > 6 → x < −2 (flipped!)'},
  // GEOMETRY
  {cat:'Geometry',term:'Triangle Area',def:'A = ½ × base × height\nHeight must be perpendicular to the base. For equilateral triangle with side s: A = (s²√3)/4'},
  {cat:'Geometry',term:'Special Right Triangles',def:'30-60-90: sides in ratio 1 : √3 : 2\n45-45-90: sides in ratio 1 : 1 : √2\nMemorise these — they appear constantly on GRE.'},
  {cat:'Geometry',term:'Circle Formulas',def:'Area = πr²\nCircumference = 2πr = πd\nArc length = (θ/360°) × 2πr\nSector area = (θ/360°) × πr²'},
  {cat:'Geometry',term:'Pythagorean Theorem',def:'a² + b² = c² (c = hypotenuse)\nCommon triples: 3-4-5, 5-12-13, 8-15-17, 7-24-25 and their multiples.'},
  {cat:'Geometry',term:'Coordinate Geometry',def:'Slope = (y₂−y₁)/(x₂−x₁)\nMidpoint = ((x₁+x₂)/2, (y₁+y₂)/2)\nDistance = √((x₂−x₁)²+(y₂−y₁)²)\nParallel lines: equal slopes. Perpendicular: slopes multiply to −1.'},
  {cat:'Geometry',term:'Polygon Interior Angles',def:'Sum of interior angles of n-gon = (n−2)×180°\nEach interior angle of regular n-gon = (n−2)×180°/n\nTriangle=180°, Quadrilateral=360°, Pentagon=540°'},
  {cat:'Geometry',term:'Volume & Surface Area',def:'Cube: V=s³, SA=6s²\nRectangular box: V=lwh, SA=2(lw+lh+wh)\nCylinder: V=πr²h, SA=2πr²+2πrh\nSphere: V=⁴⁄₃πr³, SA=4πr²'},
  // STATISTICS
  {cat:'Statistics',term:'Mean, Median, Mode',def:'Mean = sum / count\nMedian = middle value when sorted (average of 2 middle if even n)\nMode = most frequent value\nOutliers affect mean more than median.'},
  {cat:'Statistics',term:'Standard Deviation',def:'Measures spread around the mean. Higher SD = more spread.\nOn GRE you won\'t calculate it, but compare: same mean, wider spread = higher SD.'},
  {cat:'Statistics',term:'Permutations',def:'Order matters: P(n,r) = n! / (n−r)!\nExample: # of ways to arrange 3 from 5 people = 5×4×3 = 60'},
  {cat:'Statistics',term:'Combinations',def:'Order does NOT matter: C(n,r) = n! / (r!(n−r)!)\nExample: choose 3 from 5 = 5!/(3!2!) = 10\nC(n,r) = C(n,n−r)'},
  {cat:'Statistics',term:'Probability',def:'P(A) = favorable outcomes / total outcomes\nP(A or B) = P(A)+P(B)−P(A and B)\nP(A and B) = P(A)×P(B) if independent\nP(not A) = 1 − P(A)'},
  {cat:'Statistics',term:'Weighted Average',def:'Weighted avg = Σ(value × weight) / Σweights\nIf group A has avg 70 (n=10) and group B has avg 80 (n=20):\nWeighted avg = (70×10+80×20)/30 = 76.7'},
];
