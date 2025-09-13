import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true,'category is require'],
       unique: true,
    },
},
  { timestamps: true }
);

export const categoryModel =  mongoose.model('Category', categorySchema);
export default categoryModel;
