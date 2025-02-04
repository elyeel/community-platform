import { IHowto, IHowtoStep } from '../../src/models/howto.models'
import chaiSubset from 'chai-subset'
import { IUserPPDB, ProfileTypeLabel } from '../../src/models/user_pp.models'


declare global {
  namespace Chai {
    // tslint:disable-next-line:interface-name
    interface Assertion  {
      containSubset(expect: any): any;
      eqHowtoStep(expect: any, index: number)
    }
  }
}

const eqHowto =(chaiObj, utils) => {
  function compare(this: any, expected: any) {
    const subject: IHowto = this._obj
    const { _createdBy, _deleted, caption, description, difficulty_level, slug, time, title , tags} = expected
    expect(subject, 'Basic info').to.containSubset({ _createdBy, _deleted, caption, description, difficulty_level, slug, time, title , tags})
    expect(subject.cover_image, 'Cover images').to.containSubset(expected.cover_image)

    expected.steps.forEach((step, index) => {
      expect(subject.steps[index], `Have step ${index}`).to.eqHowtoStep(step, index)
    })
  }
  chaiObj.Assertion.addMethod('eqHowto', compare)
}
const eqHowtoStep = (chaiObj, utils) => {
  function compare(this: any, expected: any, index: number) {
    const subject: IHowtoStep = this._obj
    const {_animationKey, caption, text, title} = expected
    expect(subject, `Step ${index} with info`).to.containSubset({_animationKey, caption, text, title})
    expect(subject.images, `Step ${index} with images`).to.containSubset(expected.images)
  }

  chaiObj.Assertion.addMethod('eqHowtoStep', compare)
}


const eqSettings = (chaiObj, utils) => {
  type Assert<S,E> = (subject: S, expected: E) => void
  class ChainAssert<S, E> {
    asserts: Assert<S,E>[] = []
    constructor(... asserts: Assert<S,E>[]) {
      this.asserts.push(...asserts)
    }
    assert: Assert<S,E> = (subject: S, expected: E) => {
      this.asserts.forEach(assert=> assert(subject, expected))
    }
  }
  const basicInfoAssert: Assert<IUserPPDB, any> = (subject, expected) => {
    const {_authID, _deleted, _id, about, country, profileType, userName, verified, workspaceType} = expected
    expect(subject, 'Basic Info').to.containSubset({_authID, _deleted, _id, userName, verified, profileType, workspaceType, about, country})
  }
  const linkAssert: Assert<IUserPPDB, any> = (subject, expected) => expect(subject.links, 'Links').to.containSubset(expected.links)
  const coverImageAssert: Assert<IUserPPDB, any> = (subject, expected) => expect(subject.coverImages, 'CoverImages').to.containSubset(expected.coverImages)
  const locationAssert: Assert<IUserPPDB, any> = (subject, expected) => {
    expect(subject.location, 'Location').to.containSubset(expected.location)
    expect(subject.mapPinDescription, 'MapPinDescription').to.containSubset(expected.mapPinDescription)
  }
  const machineExpertiseAssert: Assert<IUserPPDB, any> = (subject, expected) => expect(subject.machineBuilderXp, 'MachineBuilderXp').to.containSubset(expected.machineBuilderXp)
  const openingHoursAssert: Assert<IUserPPDB, any> = (subject, expected) => expect(subject.openingHours, 'OpeningHours').to.containSubset(expected.openingHours)
  const plasticTypeAssert: Assert<IUserPPDB, any> =  (subject, expected) => expect(subject.collectedPlasticTypes, 'CollectedPlasticTypes').to.containSubset(expected.collectedPlasticTypes)

  const assertMap: { [key in ProfileTypeLabel]: ChainAssert<IUserPPDB, any> } = {
    workspace: new ChainAssert<IUserPPDB, any>(basicInfoAssert, coverImageAssert, linkAssert, locationAssert),
    member: new ChainAssert<IUserPPDB, any>(basicInfoAssert, coverImageAssert, linkAssert),
    'machine-builder': new ChainAssert<IUserPPDB, any>(basicInfoAssert, coverImageAssert, linkAssert, locationAssert, machineExpertiseAssert),
    'community-builder': new ChainAssert<IUserPPDB, any>(basicInfoAssert, coverImageAssert, linkAssert, locationAssert),
    'collection-point': new ChainAssert<IUserPPDB, any>(basicInfoAssert, coverImageAssert, linkAssert, locationAssert, openingHoursAssert, plasticTypeAssert),
  }

  function compare(this: any, expected: any, index: number) {
    assertMap[expected.profileType].assert(this._obj, expected)
  }

  chaiObj.Assertion.addMethod('eqSettings', compare)
}
chai.use(eqHowto);
chai.use(eqHowtoStep);
chai.use(eqSettings);
chai.use(chaiSubset)