import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { BaseEntity } from "../../common/entities/base.entity";
import { CleaningWeekdayEnum } from "../enum/cleaning-weekday.enum";

@Schema()
export class CleaningTimeSlot extends BaseEntity {
  @Prop({ required: true, validate: /^([01]?\d|2[0-4]):([0-5]?\d)$/ })
  cleaningTime: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(CleaningWeekdayEnum),
  })
  weekday: CleaningWeekdayEnum;
}

export type CleaningTimeSlotDocument = HydratedDocument<CleaningTimeSlot>;
export type CleaningTimeSlotType = Model<CleaningTimeSlotDocument>;

export const CleaningTimeSlotSchema =
  SchemaFactory.createForClass(CleaningTimeSlot);

CleaningTimeSlotSchema.index({ cleaningTime: 1, weekday: 1 }, { unique: true });
