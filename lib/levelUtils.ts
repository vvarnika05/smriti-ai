export function getLevelAndTtile(experience: number){
    if(experience < 50) return {level:1, title: "Beginner"};
    if(experience < 150) return {level:2, title: "Intermediate"};
    if(experience < 300) return {level:3, title: "Advanced"};
    return {level:4, title: "Expert"};
}