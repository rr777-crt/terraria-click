'use script'
const scoreText = document.getElementById("score")
const addText = document.getElementById("add")
const button = document.getElementById("button")
const sunsDiv = document.getElementById("suns")

let isLoadingReady = false
console.log('v', '001')

const musicList = [
  '1NF3S+!+!0N.mp3',

]
const MUSIC = {}
let loadCount = 5
musicList.forEach((m, i) => {
   const music = new Audio()
   music.src = m
   MUSIC[m] = music
   music.oncanplaythrough = (e) => {
    e.target.oncanplaythrough = null
    loadCount++
    if (loadCount === musicList.length) isLoadingReady = true
     console.log('isLoadingReady', isLoadingReady)
   }
})


let score = 0
let addPerClick = 1
let addPerSecond = 0

let suns = 0
let addSuns = 0.01

button.onclick = getClick

function getClick() {
    getScore(addPerClick)
    getSuns(addSuns)

  
    checkBGImage()
    if (isLoadingReady && score>= 100000) {
     isLoadingReady = false
     MUSIC['1NF3S+!+!0N.mp3'].play()
    }


}

function getClickAddSuns(suns_n, price) {
    if (score < price) return

    getScore(-price)
    
    addPerClick = suns_n
    addText.innerText = addPerClick
}


function getScore(n) {
    score += n
    scoreText.innerText = score
}

function getSuns(n) {
    suns += n
    sunsDiv.innerText = suns.toFixed(2)
}
function getClickAdd(n, price) {
    if (score < price) return

    getScore(-price)
    
    addPerClick = n
    addText.innerText = addPerClick
}


function mining(scorePerSec , price) {
    if (score < price) return

    getScore(-price)
    addPerSecond += scorePerSec

    console.log(scorePerSec , price, addPerSecond)
}
 
function getScoreForSuns(score_n, suns_n) {
    if (suns < suns_n) return

    getScore(score_n)
    getSuns(-suns_n)
}



function checkBGImage() {

   
  
    if (score > 1000) {
        button.style.backgroundImage = 'url(https://listium-res.cloudinary.com/image/upload/w_800,h_800,c_limit,q_auto,f_auto/ofn7qgfx0mbcijqinipi.png)'
    }
    
     if (score > 10000) {
        button.style.backgroundImage = 'url(https://i.ytimg.com/vi/csYLupfS46k/maxresdefault.jpg)'
    }
  

if (score > 100000) {
        button.style.backgroundImage = 'url(https://steamuserimages-a.akamaihd.net/ugc/927059243556337620/D522D7C9D612785B26EDD56D6F837E59B2742B81/?imw=512&amp;&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=false)'
    }

  if (score > 1000000) {
        button.style.backgroundImage = 'url(https://i.ytimg.com/vi/hPNM5CIa9Ew/maxresdefault.jpg)'
    }

  if (score > 1000000000) {
        button.style.backgroundImage = 'url(https://4.bp.blogspot.com/-MSnMZF_CJl0/W4Cc0tQ7jZI/AAAAAAAAFWU/Izf2Q6bAgnglVKE8wSFVPhavxTEsIKG6wCK4BGAYYCw/s1600/skeletron.png)'
    }

  if (score > 10000000000) {
        button.style.backgroundImage = 'url(https://i.ytimg.com/vi/a7SpPI12LBE/hqdefault.jpg)'
    }

  if (score > 1000000000000) {
        button.style.backgroundImage = 'url(https://steamuserimages-a.akamaihd.net/ugc/1765945166803883734/0F8AFE4EFD9017B8D8E5355A621C62D3BD347008/)'
    }

  if (score > 1000000000000000) {
        button.style.backgroundImage = 'url(https://steamuserimages-a.akamaihd.net/ugc/2028339742534314153/C69790E52579280CCA0583F86478B2949C00D391/?imw=512&amp;imh=463&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true)'
    }

  if (score > 1000000000000000000) {
        button.style.backgroundImage = 'url(https://i.ytimg.com/vi/cGwuOdRQhxU/maxresdefault.jpg)'
    }



  
}

setInterval( () => {
    getScore(addPerSecond)
    console.log('tick')
}, 1000)
