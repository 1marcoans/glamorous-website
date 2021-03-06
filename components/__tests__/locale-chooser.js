import React from 'react'
import {mount} from 'enzyme'
import {ThemeProvider} from 'glamorous'
import GlobalStyles from '../../styles/global-styles'
import LocaleChooser from '../locale-chooser'

const {supportedLocales, fallbackLocale} = require('../../config.json')

test('a closed locale-chooser', () => {
  setHost()
  const wrapper = mountLocaleChooser()
  testClosedState(wrapper)
})

test('an open locale-chooser', () => {
  setHost()
  const wrapper = mountLocaleChooser()
  const toggle = wrapper.find('button')
  const selector = wrapper.find('ul')
  toggle.simulate('click')

  expect(toggle.getDOMNode().getAttribute('aria-expanded')).toEqual('true')
  expect(selector.getDOMNode().getAttribute('aria-hidden')).toEqual('false')
  expect(
    selector.childAt(0).find('a').getDOMNode() === document.activeElement,
  ).toBe(true)
})

test('pressing the escape key closes the locale-selector', () => {
  setHost()
  const wrapper = mountLocaleChooser()
  const toggle = wrapper.find('button')
  toggle.simulate('click')
  document.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 27}))

  testClosedState(wrapper)
})

test('an outside click closes the locale-selector', () => {
  setHost()
  const wrapper = mountLocaleChooser()
  const toggle = wrapper.find('button')
  toggle.simulate('click')
  document.dispatchEvent(new Event('click'))

  testClosedState(wrapper)
})

test('creates localization links', () => {
  supportedLocales.forEach(l => {
    setHost(l)
    testLocalizationLinks()
  })
})

function mountLocaleChooser() {
  return mount(
    <ThemeProvider theme={GlobalStyles}>
      <LocaleChooser />
    </ThemeProvider>,
  )
}

const host = 'glamorous.rocks'
function setHost(lang = fallbackLocale) {
  process.env.LOCALE = lang

  // why can't we just do window.location.host = 'foo'?
  // https://github.com/facebook/jest/issues/890
  Object.defineProperty(window.location, 'host', {
    writable: true,
    value: `${lang === fallbackLocale ? '' : `${lang}.`}${host}`,
  })

  Object.defineProperty(window.location, 'protocol', {
    writable: true,
    value: 'https:',
  })

  Object.defineProperty(window.location, 'pathname', {
    writable: true,
    value: '/',
  })
}

function testClosedState(wrapper) {
  const toggle = wrapper.find('button')
  const selector = wrapper.find('ul')

  expect(toggle.getDOMNode().getAttribute('aria-expanded')).toEqual('false')
  expect(selector.getDOMNode().getAttribute('aria-hidden')).toEqual('true')
}

function testLocalizationLinks() {
  const wrapper = mountLocaleChooser()
  const links = wrapper.find('a')

  expect(links.length).toBe(supportedLocales.length + 1)
  supportedLocales.forEach((l, i) => {
    const prefix = l === fallbackLocale ? '' : `${l}.`
    expect(links.at(i).getDOMNode().getAttribute('href')).toEqual(
      `https://${prefix}${host}/`,
    )
  })
  expect(
    links.at(supportedLocales.length).getDOMNode().getAttribute('href'),
  ).toEqual(
    'https://github.com/kentcdodds/glamorous-website/blob/master/other/CONTRIBUTING_DOCUMENTATION.md',
  )
}
