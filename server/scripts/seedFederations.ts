import mongoose from "mongoose"
import dotenv from "dotenv"
import Federation from "../models/Federation"
import User from "../models/User"

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/goodlift"

const seedFederations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing federations
    await Federation.deleteMany({})
    console.log("Cleared existing federations")

    // Create admin users for each federation
    const ipfAdmin = new User({
      email: "ipf.admin@example.com",
      password: "password123",
      firstName: "IPF",
      lastName: "Admin",
      role: "internationalAdmin",
    })
    await ipfAdmin.save()

    const epfAdmin = new User({
      email: "epf.admin@example.com",
      password: "password123",
      firstName: "EPF",
      lastName: "Admin",
      role: "continentalAdmin",
    })
    await epfAdmin.save()

    const napfAdmin = new User({
      email: "napf.admin@example.com",
      password: "password123",
      firstName: "NAPF",
      lastName: "Admin",
      role: "continentalAdmin",
    })
    await napfAdmin.save()

    const ovkAdmin = new User({
      email: "ovk.admin@example.com",
      password: "password123",
      firstName: "ÖVK",
      lastName: "Admin",
      role: "stateAdmin",
    })
    await ovkAdmin.save()

    const bvdkAdmin = new User({
      email: "bvdk.admin@example.com",
      password: "password123",
      firstName: "BVDK",
      lastName: "Admin",
      role: "stateAdmin",
    })
    await bvdkAdmin.save()

    const paAdmin = new User({
      email: "pa.admin@example.com",
      password: "password123",
      firstName: "PA",
      lastName: "Admin",
      role: "stateAdmin",
    })
    await paAdmin.save()

    const slvAdmin = new User({
      email: "slv.admin@example.com",
      password: "password123",
      firstName: "SLV",
      lastName: "Admin",
      role: "federalStateAdmin",
    })
    await slvAdmin.save()

    const kdbAdmin = new User({
      email: "kdb.admin@example.com",
      password: "password123",
      firstName: "KDB",
      lastName: "Admin",
      role: "federalStateAdmin",
    })
    await kdbAdmin.save()

    // Create federations
    const ipf = new Federation({
      name: "International Powerlifting Federation",
      abbreviation: "IPF",
      type: "international",
      adminId: ipfAdmin._id,
      contactEmail: "ipf.admin@example.com",
      country: "International",
    })
    await ipf.save()

    // Update admin with federation ID
    ipfAdmin.federationId = ipf._id
    await ipfAdmin.save()

    const epf = new Federation({
      name: "European Powerlifting Federation",
      abbreviation: "EPF",
      type: "continental",
      parentFederation: ipf._id,
      adminId: epfAdmin._id,
      contactEmail: "epf.admin@example.com",
      country: "Europe",
    })
    await epf.save()

    epfAdmin.federationId = epf._id
    await epfAdmin.save()

    const napf = new Federation({
      name: "North American Powerlifting Federation",
      abbreviation: "NAPF",
      type: "continental",
      parentFederation: ipf._id,
      adminId: napfAdmin._id,
      contactEmail: "napf.admin@example.com",
      country: "North America",
    })
    await napf.save()

    napfAdmin.federationId = napf._id
    await napfAdmin.save()

    const ovk = new Federation({
      name: "Österreichischer Verband für Kraftdreikampf",
      abbreviation: "ÖVK",
      type: "national",
      parentFederation: epf._id,
      adminId: ovkAdmin._id,
      contactEmail: "ovk.admin@example.com",
      country: "Austria",
    })
    await ovk.save()

    ovkAdmin.federationId = ovk._id
    await ovkAdmin.save()

    const bvdk = new Federation({
      name: "Bundesverband Deutscher Kraftdreikämpfer",
      abbreviation: "BVDK",
      type: "national",
      parentFederation: epf._id,
      adminId: bvdkAdmin._id,
      contactEmail: "bvdk.admin@example.com",
      country: "Germany",
    })
    await bvdk.save()

    bvdkAdmin.federationId = bvdk._id
    await bvdkAdmin.save()

    const pa = new Federation({
      name: "Powerlifting America",
      abbreviation: "PA",
      type: "national",
      parentFederation: napf._id,
      adminId: paAdmin._id,
      contactEmail: "pa.admin@example.com",
      country: "USA",
    })
    await pa.save()

    paAdmin.federationId = pa._id
    await paAdmin.save()

    const slv = new Federation({
      name: "Salzburger Landesverband",
      abbreviation: "SLV",
      type: "federalState",
      parentFederation: ovk._id,
      adminId: slvAdmin._id,
      contactEmail: "slv.admin@example.com",
      city: "Salzburg",
      country: "Austria",
    })
    await slv.save()

    slvAdmin.federationId = slv._id
    await slvAdmin.save()

    const kdb = new Federation({
      name: "Kraftdreikampf Bayern",
      abbreviation: "KDB",
      type: "federalState",
      parentFederation: bvdk._id,
      adminId: kdbAdmin._id,
      contactEmail: "kdb.admin@example.com",
      city: "Munich",
      country: "Germany",
    })
    await kdb.save()

    kdbAdmin.federationId = kdb._id
    await kdbAdmin.save()

    console.log("Federation hierarchy seeded successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding federations:", error)
    process.exit(1)
  }
}

seedFederations()

