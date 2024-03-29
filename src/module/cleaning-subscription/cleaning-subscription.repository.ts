import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CleaningBooking } from "../cleaning-booking/entities/cleaning-booking.entity";
import { CleaningBookingPaymentStatusEnum } from "../cleaning-booking/enum/cleaning-booking-payment-status.enum";
import { CleaningBookingStatusEnum } from "../cleaning-booking/enum/cleaning-booking-status.enum";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  CleaningSubscription,
  CleaningSubscriptionDocument,
  CleaningSubscriptionType,
} from "./entities/cleaning-subscription.entity";

@Injectable()
export class CleaningSubscriptionRepository extends GenericRepository<CleaningSubscriptionDocument> {
  private readonly logger: Logger;

  constructor(
    @InjectModel(CleaningSubscription.name)
    private model: CleaningSubscriptionType,
  ) {
    const logger = new Logger(CleaningSubscriptionRepository.name);
    super(model, logger);
    this.logger = logger;
  }

  async getAllSubscriptionsForBookingRenew(
    upcomingDate: Date,
  ): Promise<CleaningSubscriptionDocument[]> {
    const modelAggregation = this.model
      .aggregate()
      .lookup({
        from: CleaningBooking.name.toLowerCase().concat("s"),
        let: { currentBookingId: "$currentBooking" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$$currentBookingId", { $toString: "$_id" }] },
                  { $eq: ["$isActive", true] },
                  {
                    $eq: [
                      "$bookingStatus",
                      CleaningBookingStatusEnum.BookingCompleted,
                    ],
                  },
                  {
                    $eq: [
                      "$paymentStatus",
                      CleaningBookingPaymentStatusEnum.PaymentCompleted,
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "currentBooking",
      })
      .unwind("$currentBooking")
      .match({
        isActive: true,
        subscriptionFrequency: {
          $ne: "OneTimeOnly",
        },
        nextScheduleDate: { $lte: upcomingDate },
      });

    const result = await modelAggregation.exec();
    return result;
  }
}
