const characters = [
  {
    name: "Aang",
    description: "The main protagonist and last surviving Airbender, burdened by the expectations of being the Avatar to restore balance to a divided world.",
    nationality: "Air Nomad",
    image: "../img/aang.png"
  },
  {
    name: "Katara",
    description: "A waterbender from the Southern Water Tribe and Aang's close ally, skilled in healing and combat.",
    nationality: "Water Tribe (Southern)",
    image: "../img/katara.png"
  },
  {
    name: "Sokka",
    description: "Katara’s brother and a strategic thinker; he supports the group with clever plans and humor.",
    nationality: "Water Tribe (Southern)",
    image: "../img/sokka.png"
  },
  {
    name: "Zuko",
    description: "A banished Fire Nation prince tasked with capturing the Avatar to restore his honor.",
    nationality: "Fire Nation",
    image: "../img/zuko.png"
  },
  {
    name: "Toph",
    description: "A blind earthbender from the prestigious Beifong family, whose true skill is underestimated by her family.",
    nationality: "Earth Kingdom",
    image: "../img/toph.png"
  },
  {
    name: "Iroh",
    description: "Zuko’s wise and compassionate uncle, a retired general who provides guidance and support.",
    nationality: "Fire Nation",
    image: "../img/iroh.png"
  },
  {
    name: "Suki",
    description: "Leader of the Kyoshi Warriors, an elite group of female fighters from Kyoshi Island.",
    nationality: "Kyoshi Island",
    image: "../img/suki.png"
  },
  {
    name: "Jet",
    description: "A charismatic rebel leader from the Earth Kingdom who challenges the status quo with his bold actions.",
    nationality: "Earth Kingdom",
    image: "../img/jet.png"
  },
  {
    name: "Zhao",
    description: "A high-ranking Fire Nation admiral and primary antagonist, ambitious and relentless in pursuit of power.",
    nationality: "Fire Nation",
    image: "../img/zhao.png"
  },
  {
    name: "Azula",
    description: "Zuko's sister, a prodigious Fire Nation princess who is a cunning and ruthless antagonist.",
    nationality: "Fire Nation",
    image: "../img/azula.png"
  },
  {
    name: "Ozai",
    description: "The Fire Lord and primary antagonist, seeking to expand the Fire Nation’s dominance and achieve supreme control over the world.",
    nationality: "Fire Nation",
    image: "../img/ozai.png"
  },
  {
    name: "Roku",
    description: "The previous Avatar from the Fire Nation who guides the current Avatar through wisdom and example.",
    nationality: "Fire Nation",
    image: "../img/roku.png"
  }
];

const frame = d3.select("#frame4")
      
// title container
const container = frame.append("div")
    .style("width", "89%")
    .style("font-size", "18px")
    .style("background-color", "var(--parchment)")
    .style("border-radius", "8px")

container.append("h2")
    .style("text-align", "left")
    .style("font-color", "#5a3e22")
    .style("font-size", 18)
    .style("font-weight", 700)
    .style("font-family", "Uncial Antiqua, cursive")
    .text("Meet the Characters")

// scroll frame
const scroll = frame.append("div")
  .attr("class", "scrollbox")
  .style("display", "flex")
  .style("gap", "20px")
  .style("width", "89%")
  .style("height", "70vh")
  .style("overflow-x", "auto")
  .style("border", "2px solid var(--ink-faded)")
  .style("border-radius", "16px")
  .style("padding", "20px");

const cards = scroll.selectAll(".card")
  .data(characters)
  .enter()
  .append("div")
  .attr("class", "card")
  .style("width", "380px")
  .style("height", "550px") 
  .style("flex", "0 0 auto") 
  .style("position", "relative")
  .style("padding", "40px")
  .style("background", "var(--parchment-lt)")
  .style("border", "none")
  .style("display", "flex")
  .style("flex-direction", "column")

cards.style("background-image", "url('img/border.png')")
  .style("background-size", "140% 105%")
  .style("background-repeat", "no-repeat")
  .style("background-position", "center");

cards.append("img")
  .attr("src", d => d.image)
  .style("width", "100%")
  .style("height", "250px")
  .style("object-fit", "contain") // prevent crop
  .style("padding-top", "16px");

// name
cards.append("h3")
  .style("margin-top", "8px")
  .text(d => d.name);

// nationality
cards.append("p")
  .html(d => `Nationality: <span style="font-weight:bold;">${d.nationality}</span>`)
  .style("margin-bottom", "4px")
  .style("opacity", 0.5)
  .style("color", "#5a3e22");

// description
cards.append("p")
  .text(d => d.description)

