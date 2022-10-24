import * as React from 'react'
import Styles from './index.module.scss'
import ParticleSystem from '@/THREE'
import { useEffect, useRef, useState } from 'react'
import AtmosphereParticle from '@/THREE/atmosphere'
import { ParticleModelProps } from '@/declare/THREE'
import * as THREE from 'three'
import Tween from '@tweenjs/tween.js'
import eventBus from '../../util/event'

function IndexPage() {
  const wrapper = useRef<HTMLDivElement | null>(null)
  let MainParticle: ParticleSystem | null = null

  const TurnBasicNum = { firefly: 0.002 }
  const al = 1500

  const tween2 = new Tween.Tween(TurnBasicNum).easing(
    Tween.Easing.Exponential.In
  )
  const tween1 = new Tween.Tween(TurnBasicNum).easing(
    Tween.Easing.Exponential.In
  )

  const Atomsphere1 = new AtmosphereParticle({
    longestDistance: al,
    particleSum: 500,
    renderUpdate: (Point) => {
      Point.rotation.x -= TurnBasicNum.firefly
    },
    callback: (Point) => {
      Point.position.z = -1 * al
    },
    onChangeModel: () => {
      tween2.stop()
      tween1.stop().to({ firefly: 0.04 }, 1500).chain(tween2)
      tween2.to({ firefly: 0.002 }, 1500)
      tween1.start()
    }
  })
  const Atomsphere2 = new AtmosphereParticle({
    longestDistance: al,
    particleSum: 500,
    renderUpdate: (Point) => {
      Point.rotation.y += TurnBasicNum.firefly
    },
    callback: (Point) => {
      Point.position.y = -0.2 * al
      Point.position.z = -1 * al
    }
  })
  const Atomsphere3 = new AtmosphereParticle({
    longestDistance: al,
    particleSum: 500,
    renderUpdate: (Point) => {
      Point.rotation.z += TurnBasicNum.firefly / 2
    },
    callback: (Point) => {
      Point.position.z = -1.2 * al
    }
  })

  const scaleNum = 600
  const Models: ParticleModelProps[] = [
    {
      name: 'cube',
      path: new URL('../../THREE/models/examples/cube.obj', import.meta.url)
        .href,
      onLoadComplete(Geometry, PointGeometry) {
        const s = 400
        Geometry.scale(s, s, s)
        Geometry.translate(500, 0, 0)
      }
    },
    {
      name: 'ball',
      path: new URL('../../THREE/models/examples/ball.obj', import.meta.url)
        .href,
      onLoadComplete(Geometry, PointGeometry) {
        Geometry.scale(scaleNum, scaleNum, scaleNum)
        Geometry.translate(-600, 0, -100)
      },
      onEnterStart(PointGeometry) {
        console.log('ball enter start')
      },
      onEnterEnd(PointGeometry) {
        console.log('ball enter end')
      }
    },
    {
      name: 'AngularSphere',
      path: new URL(
        '../../THREE/models/examples/AngularSphere.obj',
        import.meta.url
      ).href,
      onLoadComplete(Geometry, PointGeometry) {
        Geometry.scale(scaleNum, scaleNum, scaleNum)
        Geometry.translate(600, 0, -100)
      }
    },
    {
      name: 'cone',
      path: new URL('../../THREE/models/examples/cone.obj', import.meta.url)
        .href,
      onLoadComplete(Geometry, PointGeometry) {
        Geometry.scale(scaleNum, scaleNum, scaleNum)
        Geometry.translate(-600, 100, -100)
      }
    },
    {
      name: 'turing',
      path: new URL('../../THREE/models/examples/turing4.obj', import.meta.url)
        .href,
      onLoadComplete(Geometry, PointGeometry) {
        const s = 9
        Geometry.scale(s, s, s)
        // Geometry.center()
        Geometry.rotateY(-30)
        Geometry.translate(-600, -600, 0)
      }
    }
  ]
  window.changeModel = (name: string) => {
    if (MainParticle != null) {
      MainParticle.ChangeModel(name)
    }
  }

  const listener = new THREE.AudioListener()

  // 创建一个全局 audio 源
  const sound = new THREE.Audio(listener)

  // 加载一个 sound 并将其设置为 Audio 对象的缓冲区
  const audioLoader = new THREE.AudioLoader()
  audioLoader.load(
    new URL('../../assets/audio/bgm.mp3', import.meta.url).href,
    function (buffer) {
      sound.setBuffer(buffer)
      sound.setLoop(true)
      sound.setVolume(0.25)
    }
  )

  let hasOperate = false

  window.addEventListener('click', () => {
    if (!hasOperate) {
      sound.play()
      hasOperate = true
    }
  })

  windowAddMouseWheel()
  function windowAddMouseWheel() {
    const scrollFunc = function (e: WheelEvent) {
      console.log(e)

      e = e ?? window.event
      console.log(e.deltaY)

      if (e.deltaY !== 0) {
        if (e.deltaY > 0) {
          // 当滑轮向上滚动时
          console.log('页面向下')
          window.changeModel('turing')
        }
        if (e.deltaY < 0) {
          // 当滑轮向下滚动时
          window.changeModel('ball')
          console.log('页面向上')
        }
      }
    }
    document.onmousewheel = scrollFunc
  }

  const [active, setActive] = useState(true)

  useEffect(() => {
    eventBus.on('message', (text) => {
      setInterval(() => {
        setActive(true)
      }, 2000)
    })
    if (MainParticle == null && wrapper.current != null) {
      MainParticle = new ParticleSystem({
        CanvasWrapper: wrapper.current,
        Models,
        addons: [Atomsphere1, Atomsphere2, Atomsphere3],
        onModelsFinishedLoad: (point) => {
          point.rotation.y = -3.14 * 0.8
          new Tween.Tween(point.rotation)
            .to({ y: 0 }, 10000)
            .easing(Tween.Easing.Quintic.Out)
            .start()
          setTimeout(() => {
            MainParticle?.ChangeModel('turing', 2000)
          }, 2500)
          MainParticle?.ListenMouseMove()
        }
      })
    }
  })

  return (
    <div className={`${Styles.index_page} ${active ? '' : Styles.hidden} `}>
      <div className={Styles.canvas_wrapper} ref={wrapper}></div>
    </div>
  )
}

export default IndexPage
