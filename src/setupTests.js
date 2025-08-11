// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

jest.mock('axios', () => {
  const mock = {
    create: jest.fn(function () {
      return mock
    }),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  }
  return {
    __esModule: true,
    default: mock,
    ...mock,
  }
})

jest.mock('react-to-pdf', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('jspdf', () => ({
  __esModule: true,
  default: class JsPDFMock {
    save() {}
    autoTable() {}
    setFontSize() {}
    text() {}
  },
}))

jest.mock('jspdf-autotable', () => ({}))
